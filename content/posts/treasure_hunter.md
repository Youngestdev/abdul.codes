--- 
title: "Building a Treasure Hunter for an online graph maze."
description: "In this short post, I discuss the process behind the tool I used during the challenge." 
date: 2020-08-04 
---

> I think this process is called "crawling", and that's the same approach every one use.. except well, some used recursion.

The treasure hunt is an online graph maze with numerous endpoints from the test game having 50 to the last game having 5000 (+4 additional) nodes. There were about 250 participants in the online game and I came in second place - my code process died while I was fulfilling my **Director General of Ram duties** affairs. It was nice nontheless, aha!

So, [Favour](https://twitter.com/favourcodes) and I built this tool. I built the main process initially and we then brainstormed to add other features I'll discuss.

You should check out the game here - [Find Treasure App]](https://findtreasure.app/)

## Process

It's an online endpoint game so well, _GET_ requests are flying about. I was opportuned to run the test game so I studied the response gotten.. I'll share in subsections the entire process.

### Initial bootstrap

I haven't worked with python web libraries since my main focus has been to conquer DS & ALGOS. Fortunately, I was having difficulties understanding graph traversals so I used this online endpoint to practice and, it worked. The fastest I have traversed the test nodes is **271** seconds. Enough talk I think, I'll just dive in.

So, first thing I did was check the Python `requests` library and begin initial works:


```python{numberLines: true}
import requests


headers = {
    'gomoney': 'number',
    'Authorization': 'BEARER <TOKEN>'
}

def FindTreasure(node):
    url = "https://findtreasure.app/api/v1/games/test/start"
    response = requests.get(url, headers=headers).json()
    print(response)
```

That was basically the first thing I did, send a request and check it's response in JSON:

```json{numberLines: true}
{
  "paths": [
    "https://findtreasure.app/api/v1/games/test/19d80a7b-a9e2-4637-a4e9-4de42aa35909",
    "https://findtreasure.app/api/v1/games/test/482a827b-5237-473d-93fa-9a6b4fa8078c",
    "https://findtreasure.app/api/v1/games/test/5935e776-fffd-4a57-be18-f2602621ea72",
    "https://findtreasure.app/api/v1/games/test/0b5cd7f9-9c4d-4f38-97b4-d3db2fdbfaff",
    "https://findtreasure.app/api/v1/games/test/dd0fb20d-7079-4092-8d62-413b370a2530"
  ],
  "treasures": {
    "total": 0,
    "found": 0
  }
}
```

An a graph is a huge tree of connected nodes - hence the paths array. I deduced that a node is at minimum connected to one node and maximally connected to five nodes. 

Now, I have to store the `paths` gotten from the start node and subsequent nodes and traverse it continously:

```python{numberLines: true}{16-18}
import requests


headers = {
    'gomoney': 'number',
    'Authorization': 'BEARER <TOKEN>'
}

def FindTreasure(node):
    url = "https://findtreasure.app/api/v1/games/test/{}".format(node)
    response = requests.get(url, headers=headers).json()
    print(response)

    paths = response['paths']
    
    for path in Paths:
        FindTreasure(path[43:]) # slicing because we need the node ID alone.
    
    return
```

Well, that's basically recursion. Interestingly, some nodes point back to the start node so we enter a loop, visit an already visited node and sometimes the network disconnects. Ah. So I thought, create a set of visited nodes so we don't traverse that too:

```python{numberLines: true}{9,19-22}
import requests


headers = {
    'gomoney': 'number',
    'Authorization': 'BEARER <TOKEN>'
}

seen = set()

def FindTreasure(node):
    seen.add(node)
    url = "https://findtreasure.app/api/v1/games/test/{}".format(node)
    response = requests.get(url, headers=headers).json()
    print(response)

    paths = response['paths']

    for path in Paths:
        if path not in seen:
            FindTreasure(path)
            seen.add(path)
        
    
    return

```

This still doesn't work how I want it. It disconnects frequently. At this point, I schedule a usual call with Favour, we then add other features - retry handlers, multithreadings and, websocket listeners.

### Adding a retry strategy.

The frequent disconnection was becoming annoying. I haven't worked with the internet modules, so I had to google what to do... 

Luckily, I found an article that discussed retrying on getting certain responses so I followed the approach and implemented a retry strategy:

```python{numberLines: true}{2,3-15,27}
import requests
from request.adapters import HTTPAdapter
from urllib3.util import Retry


retry_strategy = Retry(
    total=1000,  # Increase.
    status_forcelist=[429, 500, 502, 503, 504],
    method_whitelist=["GET"],
    backoff_factor=1
)

adapter = HTTPAdapter(max_retries=retry_strategy)
http = requests.Session()
http.mount("https://", adapter)

headers = {
    'gomoney': 'number',
    'Authorization': 'BEARER <TOKEN>'
}

seen = set()

def FindTreasure(node):
    seen.add(node)
    url = "https://findtreasure.app/api/v1/games/test/{}".format(node)
    response = http.get(url, headers=headers).json()
    print(response)

    paths = response['paths']

    for path in Paths:
        if path not in seen:
            FindTreasure(path)
            seen.add(path)
        
    
    return

```

The retry strategy basically retries request when any of the response code in the `status_forcelist` array is returned. The maximum retries is set to 1000, this can be any value. We also changed the fer request function to the one attached to the retry strategy.

That fixed a major part. The code doesn't end until all the nodes have been traversed, now we need to improve the speed. Favour suggested **multithreading**, we did research and ended up using a _multiprocessing_ library.

We just did small google and tried out stuff. The first trial ran 13 nodes in a second.. It was wild! Lmao.

You should read on Pooling - I'm sorry I won't be able to talk about it, honestly.

We defined a worker for the pool. The worker function is the function that runs each process passed into the pool. See the highlighted lines.

```python{numberLines: true}{2,4-8}
...
from multiprocessing.pool import ThreadPool as Pool

def worker(item):
    try:
        FindTreasure(item)
    except ConnectionError:
        print("Lobatan")


def FindTreasure(node):
...
```

We have defined the worker function. It basically is a recursion mechanism, let's employ it in the main function. We defined a pool and `pulled` all nodes into the worker process - logically (or whatever), we should have a minimum of 5 different processes working.. Well, the rate limit cut our wings off, lmao.

The modified `FindTreasure(node)` function is:

```py{numberLines:true}
def FindTreasure(node):
    seen.add(node)
    url = "https://findtreasure.app/api/v1/games/test/{}".format(node)
    response = http.get(url, headers=headers).json()

    nodes = []

    paths = response['paths']
    for path in paths:
        if path not in nodes:
            nodes.append(path[43:])

    if 'start' in nodes:
        nodes.remove('start')

    nodes = [node for node in nodes if node not in seen] # Filter nodes.

    pool = Pool()
    pool.imap_unordered(worker, nodes)
    pool.close()
    pool.join()

    return print("one path down.")

```

What we did above is create a new array to store the node values from the response - the loop - and then, filter it again. We then pass the nodes into the pool process on line 19. Well, this is the main addition apart from the websocket subscription to not visit nodes people have visited. I'm lazy to write on that.

Next thing, we fixed the `__main__` code block just at the end of the file:

In this code block, we instructed our code to start from the last visited node if there's a connection error. Luckily, the retry strategy handles this but it won't hurt to have it there too.

```py

if __name__ == '__main__':
    try:
        FindTreasure("start")
    except ConnectionError:
        last = seen.pop()
        FindTreasure(last)
    except json.decoder.JSONDecodeError:
        print("shutting down gracefully.")

```

That's it, we just brainstormed and got it done. He's lazy so I have to force him, smh.

The full code from the article is now:

```py
import requests
from request.adapters import HTTPAdapter
from urllib3.util import Retry
from multiprocessing.pool import ThreadPool as Pool


retry_strategy = Retry(
    total=1000,  # Increase.
    status_forcelist=[429, 500, 502, 503, 504],
    method_whitelist=["GET"],
    backoff_factor=1
)

adapter = HTTPAdapter(max_retries=retry_strategy)
http = requests.Session()
http.mount("https://", adapter)

headers = {
    'gomoney': 'number',
    'Authorization': 'BEARER <TOKEN>'
}

seen = set()

def worker(item):
    try:
        FindTreasure(item)
    except ConnectionError:
        print("Lobatan")

def FindTreasure(node):
    seen.add(node)
    url = "https://findtreasure.app/api/v1/games/test/{}".format(node)
    response = http.get(url, headers=headers).json()

    nodes = []

    paths = response['paths']
    for path in paths:
        if path not in nodes:
            nodes.append(path[43:])

    if 'start' in nodes:
        nodes.remove('start')

    nodes = [node for node in nodes if node not in seen] # Filter nodes.

    pool = Pool()
    pool.imap_unordered(worker, nodes)
    pool.close()
    pool.join()

    return print("one path down.")

if __name__ == '__main__':
    try:
        FindTreasure("start")
    except ConnectionError:
        last = seen.pop()
        FindTreasure(last)
    except json.decoder.JSONDecodeError:
        print("shutting down gracefully.")


```



You can find the full code [here](https://github.com/Youngestdev/treasure-hunter), it covers what isn't here.

## Conclusion

Ngl, this is one of the code I'm proud of. I mean, made money from it and haha! Let me know if something is wrong, off or missing from the article if you happen to read this, thanks.
