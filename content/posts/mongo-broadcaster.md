---
title: "Introducing Mongo Broadcaster: A Multi-Channel MongoDB Change Stream Processor"
description: Broadcast MongoDB change streams to WebSocket, Redis, HTTP, and more.
date: 2025-04-21
---

About a month ago, I wrote a [blog post on streaming changes](https://blog.youngest.dev/read/miniature-realtime-stream) on certain collections in Mercury to build a real-time update system. Over the weekend and due to boredom, I built a package that'll allow you and I to stream changes from a collection and broadcast them via a defined channel such as
Websocket, Redis, HTTP streaming, or saved in a collection.

![Building a Versatile Data Streaming System with Broadcaster Package](https://res.cloudinary.com/doqqbfgk4/image/upload/v1745271783/_-_visual_selection_1_krsv1z.png)

> For now, I have decided not to implement the `delete` operation even if it was a few LOCs. The package focuses solely on `insert` and `update` operations.

In this blog post, I'll discuss the implementation of the package. It's called `broadcaster` and can be downloaded from PyPi.

## TL;DR

Install the library from PyPi:

```sh
pip install mongo-broadcaster
```

![You decide!](https://res.cloudinary.com/doqqbfgk4/image/upload/v1745271794/_-_visual_selection_qhi8lj.png)

## Abstract classes

In Mercury, the current implementation broadcasts only to a Websocket client. However, my technical partner & I were discussing on building activity logs and whatnot, and only then did it occur that I can extend this to Redis or even store the streams in another collection.

As a result, I designed a `BaseChannel` class that allows other channels to inherit its abstract methods to allow them design their own implementation:

```py
from abc import ABC, abstractmethod
from typing import Any, Dict


class BaseChannel(ABC):
    @abstractmethod
    async def connect(self):
        """Initialize connection"""
        pass

    @abstractmethod
    async def disconnect(self):
        """Close connection"""
        pass

    @abstractmethod
    async def send(self, recipient: str, message: Dict[str, Any]):
        """Send message to recipient"""
        pass
```

The `BaseChannel` is the progenitor of the Websocket, Redis, HTTP, and Database channel,s which will be discussed later on.

The `BaseChannel` class has three methods:

- `connect()`: This initializes the connection to the channel. e.g., connecting redis server instance.
- `disconnect()`: This closes the connection to the channel.
- `send(recipient, message)`: This handles the sending of messages to the registered recipient.

Let's take a look at the models defined for this package.

## Models

There are four Pydantic models defined; three for configuration and one for standardizing the response from the MongoDB stream. Let's take a look at the solo standardization model first.

### ChangeEvent

The `ChangeEvent` model class returns the log from the MongoDB stream into a presentable format for use in other functions/methods. It is defined as:

```py
class ChangeEvent(BaseModel):
	"""Standardized change event model"""
	operation: str  # 'insert'|'update'
	collection: str
	document_id: str
	data: dict
	timestamp: float
	namespace: Optional[str] = None
	recipient: Optional[str] = Field(
		None,
		description="Target recipient ID if available (for directed messaging)"
	)
```

For example, an `update` operation returns the following JSON:

```bson
{
	'_id': {
		'_data': '82680684FF000000012B042C0100296E5A1004D3EE9A783E1646B481F4358CF62D4A8D463C6F7065726174696F6E54797065003C7570646174650046646F63756D656E744B657900463C5F6964003C757365725F31323300000004'
	},
	'operationType': 'update',
	'clusterTime': Timestamp(1745257727,
	1),
	'wallTime': datetime.datetime(2025,
	4,
	21,
	17,
	48,
	47,
	405000),
	'fullDocument': {
		'_id': 'user_123',
		'name': 'Updated to test the newly added field to watch.'
	},
	'ns': {
		'db': 'test',
		'coll': 'users'
	},
	'documentKey': {
		'_id': 'user_123'
	},
	'updateDescription': {
		'updatedFields': {
			'name': 'Updated to test the newly added field to watch.'
		},
		'removedFields': [],
		'truncatedArrays': []
	},
	'fullDocumentBeforeChange': None
}
```

Now, that doesn't look all pretty. It can be formatted to:

```py
operation = 'update'
collection = 'users'
document_id = 'user_123'
data = {}
timestamp = 1745257958.0
namespace = 'test'
recipient = user_123
```

The code above is from a function `format_change_event` defined in the `utils.py` file. We'll get there, but for now, let's take a look at the other models for configuration.

### ...Config

The three configuration models are:

- `ChangeStreamConfig`
- `CollectionConfig`
- `BroadcasterConfig`

#### ChangeStreamConfig

This model defines a pipeline and options to be utilized by the `.watch()` method. That is, the configuration defined here will determine the behaviour of the change stream. The model comes predefined with a default pipeline and options field:

```py
class ChangeStreamConfig(BaseModel):
	"""Configuration for MongoDB change stream"""
	pipeline: List[Dict[str, Any]] = Field(
		default_factory=lambda: [
			{'$match': {'operationType': {'$in': ['insert', 'update']}}}
			# add support for delete later -> this requires some other changes
		]
	)
	options: Dict[str, Any] = Field(
		default_factory=lambda: {
			'full_document': 'updateLookup',
			'full_document_before_change': 'whenAvailable'
		}
	)
```

The `pipeline` is your normal aggregation pipeline. Above, the default pipeline is to match the `insert` and `update` operations executed.

The `options` field comes with two options predefined:

- `full_document` to return the full document on which the operation (insert|update) is performed on.
- `full_document_before_change` to return the previous version of the document before a change when avaialble. e.g., the document before an update was carried out.

> The document before change will not be available by default if the [capture of pre-images on the collection is not enabled](https://www.mongodb.com/docs/manual/reference/command/collMod/#chan e-streams-with-document-pre--and-post-images).

#### CollectionConfig

`CollectionConfig` is responsible for storing the details for a specific collection to be streamed. Let's take a look at the definition:

```py
class CollectionConfig(BaseModel):
	"""Configuration for a specific collection"""
	collection_name: str
	database_name: Optional[str] = None
	change_stream_config: ChangeStreamConfig = Field(default_factory=ChangeStreamConfig)
	fields_to_watch: List[str] = Field(default_factory=list)
	recipient_identifier: Optional[str] = None  # Field path to identify recipient (e.g., "owner.id")
```

The `CollectionConfig` model takes:

- the collection name
- the database name (optional)
- the change stream configuration
- a list of fields to watch for changes in the collection. If the list is empty, it watches for all fields in the collection
- an identifier for the recipient of any change. If this is left out, every connected recipient or subscribe will be broadcasted to (e.g., a general service announcement).

#### BroadcasterConfig

This is the main configuration for the tool. Here, the database URI, a list of collections and optional default database is configured. It is defined simply as:

```py
class BroadcasterConfig(BaseModel):
	"""Main configuration for the broadcaster"""
	mongo_uri: str
	collections: List[CollectionConfig]
	default_database: Optional[str] = None
```

Now that the structure for each configuration model has been laid out, let's take a look at utility functions.

## Utilities

These are essential functions that help with the smooth running for the package. The utility functions are self-explainable:

### Validate mongo connection

This function validates that the MongoDB connection is valid and live.

```py
def validate_mongo_connection(uri: str) -> bool:
	"""Verify MongoDB connection is available"""
	try:
		from motor.motor_asyncio import AsyncIOMotorClient
		client = AsyncIOMotorClient(uri)
		client.admin.command('ping')
		return True
	except Exception as e:
		logger.error(f"MongoDB connection failed: {str(e)}")
		return False
```

### Format change event

This function makes use of the `ChangeEvent` model to purify the chunk of data sent by the stream.

```py
def format_change_event(change: Dict[str, Any], config: CollectionConfig) -> ChangeEvent:
	"""Transform raw MongoDB change stream event"""
	return ChangeEvent(
		operation=change['operationType'],
		collection=change['ns']['coll'],
		document_id=str(change['documentKey']['_id']),
		data=extract_fields(change, getattr(config, 'fields_to_watch', [])),
		timestamp=change['clusterTime'].time,
		namespace=change['ns']['db'],
		recipient=None
	)
```

### Extract fields

The function filters the stream of document to pick items from the `change` dictionary registered in the `fields` lsit.

```py
def extract_fields(change: Dict[str, Any], fields: list) -> Dict[str, Any]:
	"""Extract specific fields from change stream data"""
	result = {}
	for field in fields:
		keys = field.split('.')
		value = change
		try:
			for key in keys:
				value = value.get(key, {})
			if value:  # Only add non-empty values
				result[field] = value
		except AttributeError:
			continue
	return result
```

### Backoff handler

For retries:

```py
def backoff_handler(details):
	"""Exponential backoff for connection retries"""
	logger.warning(
		f"Retrying in {details['wait']:.1f} seconds after "
		f"{details['tries']} tries calling {details['target']}"
	)
```

## Channels

Broadcaster currently supports four channels:

- Websocket
- Redis
- HTTP
- Database logging

![Which channel should be used for broadcasting MongoDB changes?](https://res.cloudinary.com/doqqbfgk4/image/upload/v1745271794/_-_visual_selection_qhi8lj.png)

All four channels inherit the base channel and contain an additional `broadcast` method. Each of these channels has the methods:

- `connect(client_id)`: registers a new connection
- `disconnect(client_id)`: disbands a connection
- `send(recipient, message)`: sends a message to a designated client
- `broadcast(message)`: sends message to all connected clients

### Websocket

For Websocket, here's the implementation:

```py
class WebSocketChannel(BaseChannel):
	def __init__(self):
		self.active_connections: Dict[str, WebSocket] = {}

	async def connect(self, client_id: str, websocket: WebSocket):
		"""Register a new websocket connection"""
		await websocket.accept()
		self.active_connections[client_id] = websocket

	async def disconnect(self, client_id: str):
		"""Remove a websocket connection"""
		if client_id in self.active_connections:
			del self.active_connections[client_id]

	async def send(self, recipient: str, message: Dict[str, Any]):
		"""Send message to specific client"""
		if recipient in self.active_connections:
			try:
				await self.active_connections[recipient].send_json(message)
			except Exception as e:
				await self.disconnect(recipient)
				raise e

	async def broadcast(self, message: Dict[str, Any]):
		"""Send message to all connected clients"""
		for connection in list(self.active_connections.values()):
			try:
				await connection.send_json(message)
			except:
				# Remove dead connections
				client_id = next(
					(k for k, v in self.active_connections.items()
						if v == connection), None)
				if client_id:
					await self.disconnect(client_id)
```

## Redis

```py

class RedisPubSubChannel(BaseChannel):
	def __init__(self, redis_uri: str, channel_prefix: str = "mongo_change:"):
		self.redis_uri = redis_uri
		self.channel_prefix = channel_prefix
		self.redis = None

	async def connect(self):
		"""Initialize Redis connection"""
		self.redis = await aioredis.from_url(self.redis_uri)

	async def disconnect(self):
		"""Close Redis connection"""
		if self.redis:
			await self.redis.close()

	async def send(self, recipient: str, message: Dict[str, Any]):
		"""Publish message to recipient-specific channel"""
		channel = f"{self.channel_prefix}{recipient}"
		await self.redis.publish(channel, json.dumps(message))

	async def broadcast(self, message: Dict[str, Any]):
		"""Publish message to broadcast channel"""
		channel = f"{self.channel_prefix}broadcast"
		await self.redis.publish(channel, json.dumps(message))
```

For redis, the channel name can be set and if not set, the `mongo_change` will be subscribed to for stream changes.

### HTTP

This is specially designed for webhooks.

```py
class HTTPCallbackChannel(BaseChannel):
	def __init__(self, endpoint: str, headers: Dict[str, str] = None, timeout: int = 5):
		self.endpoint = endpoint
		self.headers = headers or {}
		self.timeout = aiohttp.ClientTimeout(total=timeout)
		self.session = None

	async def connect(self):
		"""Create aiohttp session"""
		self.session = aiohttp.ClientSession(headers=self.headers, timeout=self.timeout)

	async def disconnect(self):
		"""Close aiohttp session"""
		if self.session:
			await self.session.close()

	async def send(self, recipient: str, message: Dict[str, Any]):
		"""Send HTTP POST request"""
		payload = {
			"recipient": recipient,
			"event": message
		}
		async with self.session.post(self.endpoint, json=payload) as response:
			if response.status >= 400:
				raise ValueError(f"HTTP request failed with status {response.status}")

	async def broadcast(self, message: Dict[str, Any]):
		"""Send broadcast HTTP POST request"""
		async with self.session.post(self.endpoint, json={"event": message}) as response:
			if response.status >= 400:
				raise ValueError(f"HTTP request failed with status {response.status}")
```

It is important to note that the current implementation is very basic and can be fine tuned for secure webhook use cases. For example:

```py
class WebhookChannel(HTTPCallbackChannel):
	async def send(self, recipient: str, message: dict):
		"""Add webhook signing or retry logic"""
		message["signature"] = generate_hmac(message)
		await super().send(recipient, message)
```

### Database

This channel essentially records the change back to the database, either tied to a single recipient or as a broadcast under the configured parameters.

> I think anyone can do this without necessarily using this library, but yay to anything that makes life easy

```py
class DatabaseChannel(BaseChannel):
	def __init__(self, mongo_uri: str, database: str, collection: str):
		self.mongo_uri = mongo_uri
		self.database_name = database
		self.collection_name = collection
		self.client = None
		self.collection = None

	async def connect(self):
		"""Initialize MongoDB connection"""
		self.client = AsyncIOMotorClient(self.mongo_uri)
		self.collection = self.client[self.database_name][self.collection_name]

	async def disconnect(self):
		"""Close MongoDB connection"""
		if self.client:
			self.client.close()

	async def send(self, recipient: str, message: Dict[str, Any]):
		"""Save message to database"""
		if not self.collection:
			raise RuntimeError("Database connection not established")

		document = {
			"recipient": recipient,
			"message": message,
			"timestamp": datetime.datetime.utcnow()
		}
		await self.collection.insert_one(document)

	async def broadcast(self, message: Dict[str, Any]):
		"""Save broadcast message to database"""
		document = {
			"message": message,
			"timestamp": datetime.datetime.utcnow(),
			"broadcast": True
		}
		await self.collection.insert_one(document)
```

## Exceptions

The `ChannelNotConnectedError` exception is raised when there's no valid channel configured for broadcast.

```py
class ChannelNotConnectedError(Exception):
	"""Raised when no output channels are configured"""
	pass
```

There's another that hasn't been implemented yet - that's to check for invalid configuration. Pydantic type checking can handle that.

## Broadcasting

All these channels need an outlet for subscribers. The `MongoChangeBroadcaster` class comes to our rescue:

```py
class MongoChangeBroadcaster:
	def __init__(self, config: BroadcasterConfig):
		self.config = config
		self.mongo_client: Optional[AsyncIOMotorClient] = None
		self.channels: List[BaseChannel] = []
		self._running = False
		self._tasks: List[asyncio.Task] = []
```

The class has nine methods.

### Initialize connection

This method validates and initalizes the MongoDB connection. Validation is done with the aid of the `validate_mongo_connection` utility function.

```py
async def _initialize_connection(self):
	"""Validate and establish MongoDB connection"""
	if not validate_mongo_connection(self.config.mongo_uri):
		raise ConnectionError("Invalid MongoDB connection URI")
	self.mongo_client = AsyncIOMotorClient(self.config.mongo_uri)
```

### Add channel

A station owner needs to add a channel for subscribers to stream events. That's what this function does:

```py
def add_channel(self, channel: BaseChannel):
	"""Register an output channel"""
	self.channels.append(channel)
```

### Start streaming

After initialization and channel addition, the stream is started. The method raises an exception if no channel is configured.

```py
async def start(self):
	"""Start all change stream watchers"""
	if not self.channels:
		raise ChannelNotConnectedError("No output channels configured")

	await self._initialize_connection()
	self._running = True

	for collection_config in self.config.collections:
		task = asyncio.create_task(
			self._watch_collection_with_retry(collection_config)
		)
		self._tasks.append(task)
```

### Watch collection with retry

Hiccups can happen during transmission. Instead of stopping the entire stream, the broadcast station retries for a bit. The method that handles this is defined:

```py
async def _watch_collection_with_retry(self, config: CollectionConfig):
	"""Wrapper with exponential backoff for resiliency"""
	from tenacity import retry, stop_after_attempt, wait_exponential

	@retry(
		stop=stop_after_attempt(3),
		wait=wait_exponential(multiplier=1, min=4, max=10),
		before_sleep=backoff_handler
	)
	async def _watch():
		await self._watch_collection(config)

	await _watch()
```

## Watch collection

Since the stream has started, we need to make sure our agents are on site to get us information. The`watch_collection()` method takes the data from the collection config and _watches_ the changes:

```py
async def _watch_collection(self, config: CollectionConfig):
	"""Monitor a single collection for changes"""
	db_name = config.database_name or self.config.default_database
	if not db_name:
		raise ValueError("Database name must be specified")

	db = self.mongo_client[db_name]
	collection = db[config.collection_name]

	try:
		async with collection.watch(
			pipeline=config.change_stream_config.pipeline,
			**config.change_stream_config.options
		) as change_stream:
			async for change in change_stream:
				if not self._running:
					break
				await self._process_change(change, config)

	except asyncio.CancelledError:
		logger.info(f"Stopped watching {config.collection_name}")
	except Exception as e:
		logger.error(f"Error watching {config.collection_name}: {str(e)}")
		raise
```

## Extract nested field

Some documents have nested fields, and the recipient identifier can be in a field such as `order.customer.id`. The helper method breaks these fields to get the recipient:

```py
 def _extract_nested_field(self, doc: dict, field_path: str) -> Optional[Any]:
	"""Safely extract nested fields like 'owner.id'"""
	value = doc
	for key in field_path.split('.'):
		value = value.get(key, {})
		if not value:
			return None
	return value
```

> This may not work for really complex scenarios now that I think about it. To be safe, make use of simple identifiers like `_id`.

### Process change

When the streams are logged into the broadcast station, they need to be processed to retrieve the important information. Here, the method also converts the change event into a neater `ChangeEvent` model instance.

```py
 async def _process_change(self, change: dict, config: CollectionConfig):
	"""Process and distribute a change event"""
	try:
		# Extract recipient if configured
		recipient = None
		if config.recipient_identifier:
			doc = change.get('fullDocument') or change.get('fullDocumentBeforeChange', {})
			recipient = self._extract_nested_field(doc, config.recipient_identifier)

		event = format_change_event(change, config)
		event.recipient = str(recipient) if recipient else None
		await self._send_to_channels(event)

	except Exception as e:
		logger.error(f"Error processing change: {str(e)}")
```

### Send to channels

The method broadcasts to registered channels to send to recipients or broadcast to the whole network via this method:

```py
 async def _send_to_channels(self, event: ChangeEvent):
	"""Broadcast to all registered channels"""
	for channel in self.channels:
		try:
			if event.recipient:  # Targeted delivery
				await channel.send(event.recipient, event.dict())
			else:  # Broadcast
				await channel.broadcast(event.dict())
		except Exception as e:
			logger.error(f"Channel {type(channel).__name__} failed: {str(e)}")
```

### Stop

Every beginning must have an end. The `stop()` method cancels all the asynchronous tasks deployed and closes the MongoDB client when invoked. This is great for `shutdown()` events.

```py
 async def stop(self):
	"""Gracefully shutdown all watchers"""
	self._running = False
	for task in self._tasks:
		task.cancel()
	await asyncio.gather(*self._tasks, return_exceptions=True)
	if self.mongo_client:
		self.mongo_client.close()
```

## Example

Here's a WebSocket channel example:

```py
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket
from starlette.websockets import WebSocketDisconnect

from broadcaster import MongoChangeBroadcaster, BroadcasterConfig, CollectionConfig, WebSocketChannel


@asynccontextmanager
async def lifespan(app: FastAPI):
	await broadcaster.start()

	yield
	await broadcaster.stop


app = FastAPI(lifespan=lifespan)
websocket_channel = WebSocketChannel()

config = BroadcasterConfig(
	mongo_uri="mongodb://localhost:27017",
	collections=[
		CollectionConfig(
			collection_name="users",
			recipient_identifier="fullDocument._id",  # Send to user who owns the document
			database_name="test",
		),
	]
)

broadcaster = MongoChangeBroadcaster(config)
broadcaster.add_channel(websocket_channel)


@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
	await websocket_channel.connect(user_id, websocket)
	try:
		while True:
			await websocket.receive_text()  # Keep connection alive
	except WebSocketDisconnect:
		await websocket_channel.disconnect(user_id)


if __name__ == "__main__":
	import uvicorn

	uvicorn.run(app, host="0.0.0.0", port=8000)
```

To test:

1. Run: `python websocket_example.py`
2. Open a websocket connection with a user ID: `websocat ws://0.0.0.0:8000/ws/ydev`
3. Make a change into the collection. In the example, I have a `users` collection in my `test` database.
4. Make a change, for example:
			`db.users.updateOne({_id: 'ydev'}, {"$set": {"name": "Updated to test the newly added field to watch changes"}})`
5. Listen for changes in the WebSocket console

## Conclusion

This is a lengthy blog post, so I must commend you if you read or skipped to this part. I'm going to try to write a full documentation for the library (amen).

It's open source on GitHub on [https://github.com/Youngestdev/broadcaster](https://github.com/Youngestdev/broadcaster).