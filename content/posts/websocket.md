---
title: "Miniature Realtime Stream"
description: Fix a description.
date: 2025-03-23
---

Building Mercury has been fun. I have learned more about software development and MongoDB in particular. For instance, I had never had to make use of MongoDB aggregations until Mercury, and it has been fascinating.

This little article is just to talk about MongoDB's `.watch()`. In a few words, what the method does is to _watch_ the changes going on in and around a collection. For example, it can log the streams of insert, update, and delete operations happening to the selected collection.

## Okay, what was I building?

So, I wanted to stream the changes going on in the database and communicate it via a websocket channel to the frontend guys. There's an activity tab that should update the user on changes especially as the application is a multi-user-tied-to-one-account application.

## So...

**You need to enable pre-image and post-image. I enabled it for all my collections from my mongosh console by running: **

```shell
const collections = db.getCollectionNames().filter(c => !c.startsWith('system.'));

collections.forEach(collectionName => {
  db.runCommand({
    "collMod": collectionName,
    "changeStreamPreAndPostImages": { "enabled": true }
  });
});
```

I started by building out the websocket connection manager:

```py
import asyncio

from fastapi import WebSocket
from typing import Dict
from mercury.infra.logger import logger


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.lock = asyncio.Lock()

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        async with self.lock:
            self.active_connections[user_id] = websocket
        logger.info(f"Client {user_id} connected. Active connections: {list(self.active_connections.keys())}")

    async def disconnect(self, user_id: str):
        async with self.lock:
            if user_id in self.active_connections:
                del self.active_connections[user_id]
        logger.info(f"Client {user_id} disconnected. Active connections: {list(self.active_connections.keys())}")

    async def send_to_client(self, user_id: str, message: str):
        async with self.lock:
            if user_id in self.active_connections:
                websocket = self.active_connections[user_id]
                await websocket.send_text(message)
                logger.info(f"Message sent to client {user_id}")
            else:
                logger.info(f"No active connection found for user {user_id}")
```

It's pretty straightforward. It handles the connection, keeping track and sending back to the designated users.

Then, the main action - the websocket route. For changes to be listened to, a connection needs to be established for a user. I'm not going to go deep at all, I'm just going to illustrate it. Pardon me, these days, I have become lazy.

Let's go however. I started by connecting a valid user aka storing the user's credential for subsequent communication:

```py
if not client_id and not token:
    await websocket.close(code=1008, reason="Client ID and token required")
    return

if app.get_client_type_from_client_id(client_id) is None:
    await websocket.close(code=1000, reason="Invalid client ID")

user = app.authentication_service.decode_jwt(
    token
)

db = await app.database.get_db()

valid_user = await db.users.find_one({
    "email": user["user_id"]
})

if valid_user is None:
    await websocket.close(code=1000, reason="User does not exist")
    return

await app.websocket.connect(str(valid_user["_id"]), websocket)
```

First, I try to ascertain the validity of the client's ID, token and user before proceeding to connect the user, I make use of the ID as it's unique for each of them.

## Let the watch party begin

In a `try..except` block, I start the main party. I need to be up to date with all the operations but I don't need all the information being passed around as well. Therefore, I wrote an aggregation pipeline to return just the fields I'm interested in:

```py
pipeline = [
    {'$match': {'operationType': {'$in': ['insert', 'update', 'delete']}}},
    {"$project": {
        "operationType": 1,
        "documentKey": 1,
        "ns": 1,
        "fullDocument.creator_id": 1,
        "fullDocument.owner._id": 1,
        "fullDocument.owned_by": 1,
        "fullDocument.quantity_in_stock": 1,
        "fullDocument.reorder_point": 1,
        "fullDocumentBeforeChange.owned_by": 1,
        "fullDocumentBeforeChange.creator_id": 1
    }}
]
```

In some cases, I need the full document before a change is effected. An example is a delete operation where I need to get the document details to update the stream. I defined them in an options dict:

```py
options = {
    'full_document': 'updateLookup',
    'full_document_before_change': 'required'
}
```

Then I begin the watch operation and store the operation type `operation_type`, document key (ID) `document_key`, and the collection `collection`:

```py
async with db.watch(pipeline, **options) as change_stream:
    async for change in change_stream:
        operation_type = change['operationType']
        document_key = change['documentKey']["_id"]
        collection = change["ns"]["coll"]

```

With all these in place, I defined the specific actions to be carried out (mainly websocket broadcast) for each action. Here's the one for the `delete` operation:

```py
if operation_type == 'delete':
    full_doc = change.get('fullDocumentBeforeChange', {})

    match collection:
        case "inventory_items":
            business = await db.businesses.find_one({
                "_id": full_doc.get("owned_by")
            })
            recipient = business["owner"].id if business else None
        case "orders":
            business = await db.businesses.find_one({
                "_id": full_doc.get("creator_id")
            })
            recipient = business["owner"].id if business else None
        case _:
            logger.info(f"Unhandled collection for delete: {collection}")
            recipient = None

    if recipient:
        message = f"Change detected: {operation_type} on document {document_key} in collection {collection}"
        logger.info(f"Attempting to send message to recipient: {recipient}")
        await app.websocket.send_to_client(str(recipient), message)
    else:
        logger.info(f"No recipient found for change: {operation_type} in {collection}")
```

The action for `insert` and `update` are similar si they're grouped togehter:

```py
elif operation_type in ['insert', 'update']:
    full_doc = change.get('fullDocument', {})

    match collection:
        case "orders":
            business = await db.businesses.find_one({
                "_id": full_doc.get("creator_id")
            }, {"owner": 1})
            recipient = business["owner"].id if business else None
        case "inventory_items":
            business = await db.businesses.find_one({
                "_id": full_doc.get("owned_by")
            }, {"owner": 1})
            recipient = business["owner"].id if business else None

            if full_doc.get("quantity_in_stock") <= full_doc.get("reorder_point"):
                await app.websocket.send_to_client(str(recipient),
                                                "Stock low, please restock the inventory to continue issuing orders.")

        case _:
            logger.info(f"Unhandled collection for {operation_type}: {collection}")
            recipient = None

    if recipient:
        message = f"Change detected: {operation_type} on document {document_key} in collection {collection}"
        logger.info(f"Attempting to send message to recipient: {recipient}")
        await app.websocket.send_to_client(str(recipient), message)
    else:
        logger.info(f"No recipient found for change: {operation_type} in {collection}")

    else:
        logger.info(f"Unhandled operation type: {operation_type}")
```

The end:

```py
except asyncio.CancelledError:
    # Handle cancellation gracefully
    logger.info("Task was cancelled. Cleaning up...")
except WebSocketDisconnect:
    await app.websocket.disconnect(str(valid_user["_id"]))
    logger.info(f"User {valid_user["_id"]} is disconnected")
```

I connected an active session:

```shell
Client 67a9f47786c624adede7---- connected. Active connections: ['67a9f47786c624adede7----']
```

```shell
Change detected: delete on document 67aa00fce173bf9d4ba2---- in collection orders
```

## If you were...

If you were to build a streaming endpoint like this, how would you approach it?