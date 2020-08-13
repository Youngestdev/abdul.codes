--- 
title: "Linked Lists 101 - The Linked List class" 
description: "In this blog post, I'd discuss the linked list class, the use and some of its methods." 
date: 2020-08-13 
---

In the previous post, I did an introduction to Linked Lists. The feedbacks and corrections were the motivation to continue, I'm happy you people found it nice, thanks!

Today, I'll be taking a look at the linked list class, its use and some methods. If you haven't read the introductory post to linked list, [you should read it first](linked-lists-101-basic-introductions-nodes).

> Before you proceed, I am more comfortable writing in Python, I'd try my best to translate code to JavaScript and the likes :)

## The Linked List Class

As I discussed in the previous post, a linked list is a continuous list of nodes. The nodes make the linked list, actually. The linked list class serves as a wrapper for adding functionalities and efficiently using the nodes. Take for instance, I want to append a node to the middle of a long chain of nodes, I'd have to perform it manually like this:

```py{codeTitle: Node.py}
nodes = Node(10)
nodes.next = Node(11)
nodes.next.next = Node(13)
nodes.next.next.next = Node(14)

# Insert a new node after 11.

new_node = Node(12)
new_node.next = nodes.next.next
nodes.next.next = new_node

```

Stressful, isn't it? Imagine I need to perform this same operation for a couple of nodes, say 10, I have to manually do this every time. This brings forth unnecessary code bulkiness and complexity - space. Having a Linked List class with a method solves this all.

The Linked List class is an independent class. The initialisation of nodes in the class uses the `Node` class still. Here is a linked list class implementation:

In Python:

```py{codeTitle: LinkedList.py}{numberLines: true}
import Node # You could as well fix the Node class here.

class LinkedList:
    def __init__(self, value):
        self.head = Node(value)
```

In JavaScript:

```javascript{codeTitle: LinkedList.js}
// You should export the Node class.

import Node from './Node'

class LinkedList {
    constructor(value = 0){
        this.head = new Node(value)
    }
}
```

### Adding Nodes To The Linked List

A linked list begins from a head node to the tail node. So, when you initialise a linked list, you start with a head node and to add other nodes, you need to add a method for that. We'll add two methods: 

1. `append` - This adds a new node after a head node or tail node
2. `prepend` - This adds a new node before the existing nodes in the linked list, making it the new head.

Let's start with the `append` method:

In Python

```py{codeTitle: LinkedList.py}{numberLines: true}
class LinkedList:
    def __init__(self, value):
        self.head = Node(value)

    def append(self, value):
        new_node = Node(value)
           
        if self.head.next is none:
            self.head.next = new_node
            return
        
        head = self.head
        while head.next:
            head = head.next
        head.next = new_node
```

In JavaScript

```javascript{numberLines: true}
class LinkedList {
    constructor(value = 0){
        this.head = new Node(value)
    }

    append(value) {
        let head = this.head
        let new_node = new Node(value)
        if (head == null) {
            head = new_node
            return head
        }

        while(head && head.next != null) {
            head = head.next
        }
        head.next = new_node
        return head
    }
}
```

I'll break down the process in the code block in a quick summary:

> The first thing the method does is to create a new node and store it in a variable. Next, it checks if there's only one node in the list, if that turns out to be true, append the node to the head then return. However, if the head node isn't the only node in the linked list, traverse the node till we get to the tail and append it there.

Here's a diagramatic explanation:

![Append A Node](https://res.cloudinary.com/adeshina/image/upload/v1597330627/z31vpiv7i3s9p0vyzkkd.png)

Let's implement the `prepend` method, this is actually very simple. Just after the `append` method, add the following block of code:

In Python

```py{numberLines:true}{codeTitle: LinkedList.py}
def prepend(self, value):
    new_node = Node(value)
    new_node.next = self.head
    self.head = new_node
```

In JavaScript:

```javascript{numberLines: true}{codeTitle: LinkedList.js}
prepend(value) {
    let new_node = new Node(value)
    let head = this.head
    new_node.next = head
    this.head = new_node
    return current
}
```

The prepend method is self-explanatory. What it does is it appends the head of a linked list to a newly created node and change the head of the linked list to the newly created node.

Here's a diagramatic explanation of the prepend method:

![Prepend method](https://res.cloudinary.com/adeshina/image/upload/v1597330749/sdxskzfmjfdfipgb0pq3.png)


The last method I'll be implementing in this blogpost is the `printList` method. This method enables us output ( or print ) all the node values in the linked list as an array. Implement this method after the `prepend` method.

In Python:

```py{numberLines: true}{codeTitle: LinkedList.py}
def printList(self):
    head = self.head
    output = []
    while head.next is not None:
        output.append(head.value)
        head = head.next
    return output
```

In JavaScript:

```javascript{codeTitle: LinkedList.js}{numberLines: true}
printList() {
    let head = this.head
    let result = []
    while (head != null) {
        result.push(head.value)
        head = head.next
    }
    return result
}
```

The `printList` method traverse each node in the linked list and stores the value in the `result` array.

## Conclusion

In this short blogpost, I introduced the linked list class and basic methods - append and prepend. In the next blogpost, I will talk about other methods for reversing a linked list, deleting nodes and swapping nodes.
