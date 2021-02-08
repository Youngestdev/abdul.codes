--- 
title: "A Couple of Simple Array Questions"
description: "I was opportune to solve some basic array questions, jonzed one but solved it."
date: 2021-02-08
---

I was opportune to solve some basic level array questions yesterday and today. I made some silly mistakes in the
process, there's a total of 9 questions, but I'll be discussing 4 of the question solutions in this blog post.

The question and answering model for the problems is the code judge I/O system of evaluation. In smaller English, read
from input and print out answers.

## Question 1 - Double Reverse.

### Problem statement:

---
You are given an array consisting of n integers (the elements of the array are enumerated from 1 to n). Your task is to
reverse the subarray from index a to index b, and then reverse the subarray from index c to index d.

**Input**

The first line of input contains four integers n, a, b, c, d (4 ≤ n ≤ 1000, 1 ≤ a, b, c, d ≤ n, a < b, c < d).

The second line contains n integers — the elements of array. The absolute value of each element is not greater than 10 9
.

**Output**

Print resulting array.

**Examples:**

![Example One](https://res.cloudinary.com/adeshina/image/upload/v1612736407/stwcp3ujlrvnak7ffar8.png)

---

### Solution

This question is a simple in-place reversal question. You are expected to reverse the subarray from index a to b and c to d. That is for the first example, the operation below is performed:


```python
a,b,c,d = 2, 3, 6, 7
arr = [4, -1, 3, 6, 1, 2, 5]

arr[a-1:b] = arr[a-1:b][::-1]
arr[c-1:d] = arr[c-1:d][::-1]

print(arr) # [4,6,3,-1,1,5,2]
```

The first index of the subarray is reduced by 1 to follow the standard indexing system in the code block above. With the process explain, the full solution in regards to the problem statement is:


```py
if __name__ == '__main__':
    try:
        n, a, b, c, d = map(int, input().split())
        arr = list(map(int, input().split()))
 
        arr[a-1:b] = arr[a-1:b][::-1]
        arr[c-1:d] = arr[c-1:d][::-1]
 
        print(*arr, sep=" ")
 
    except Exception as e:
        pass
```

The first line of input is mapped into the variables using Python's `map()` function. Likewise, the array of numbers passed in the second line is stored in a list.

## Question 2 - Server

### Problem statement

---

Yura got a job as a junior system administrator at «TIGER Groups». His duties include controlling the
work of n servers (numbered from 1 to n).

Unfortunately, one of the servers stopped working. Now he urgently needs to restore the work of the
server, but before that he must get its identification number. Because of his inexperience, Jura was only
able to get the identification numbers of the working servers, and now he is asking for your help. Help
him get the identification number of the server that isn’t working.

**Input**

The first line of input contains integer n (2 ≤ n ≤ 100 000) — total number of servers.

The second line contains n − 1 unique integers ai (1 ≤ ai ≤ n) — identification numbers working servers.

**Output**

Print one integer — identification number of non-working server

**Examples:**

![Example Two](https://res.cloudinary.com/adeshina/image/upload/v1612736441/hmpkitcx9jizvfzv6jnx.png)

---

This question is a variant of the **missing positive integer**. The solution to this problem is to write an algorithm that finds the missing integer in the array ( set of numbers ) given. 

This can be done in a number of ways, however, let's follow a traditional approach:

```python
def solution(n, nums):
    nums_set = set(nums)
    for server_no in range(1, n+1):
        if server_no not in nums_set:
            return server_no
 
if __name__ == '__main__':
    try:
        n = int(input())
        number_of_running_servers = list(map(int, input().split()))
        print(solution(n, number_of_running_servers))
    except Exception as e:
        pass
```

The number of running servers is placed into set whose length will be less than the total number of servers. The next step is to loop from 1 to n+1 and return whatever number is missing from the set.

## Question Three - Dasha's Lemonade

### Problem statement

---

Dasha loves lemonade! Today she went to the store and bought n bottles of lemonade. Capacity of each
bottle is t liters.

She put the bottles in line and started to do the following: she takes one bottles, drinks 1 liter from this
bottle, put the bottle back and moves to the next bottle. Let’s call this set of operations as one step.
(After the last bottle she moves to the first one.)
In the beginning, all the bottles are full of lemonade. Dasha wants to determine whether there will be any
empty bottle after k steps or not. Help her.

**Input**

The first line contains three integers n, t and k (1 ≤ n ≤ 10 9 , 1 ≤ t ≤ 10 9 , 1 ≤ k ≤ 10 9 ) — the number of
bottles, capacity of each bottle and number of steps respectively.

**Output**

Print 1, if it will be any empty bottle after k steps, otherwise print −1

**Examples:**

![Example three](https://res.cloudinary.com/adeshina/image/upload/v1612738373/eaummljcdyrgbk54fc4s.png)

---

This is a simple math question. The solution to this is:

```
remainder = total quantity of lemonades - steps

if remainder >= n
    there are no empty bottles
else
    there is at least an empty bottle

where total quantity = n * t
```

That said, the solution for this question is:

```python
if __name__ == '__main__':
    try:
        n, t, k = map(int, input().split())
        total_quantity = n * t
        remainder = total_quantity - k
 
        if remainder >= n:
            print(-1)
        else:
            print(1)
    except:
        pass
```

## Question 4 - Unique Set

### Problem statement

---

Anton has an array a of size n, where the value of each element is in the range from 1 to k (inclusively).

Anton wants to know: is there any segment of size k, containing all the values from 1 to k?

If there is such segment, you should print the beginning position of this segment (elements are enumerated
from 1). Otherwise, print −1. If there are different possible answers, then print the minimum value.

**Input**

The first line contains two integers n and k (1 ≤ k ≤ n ≤ 2 · 105
).

The second line contains n integers ai (1 ≤ ai ≤ k) — the elements of an array a.

**Output**

Print the answer.

**Examples:**

![Example four](https://res.cloudinary.com/adeshina/image/upload/v1612738740/nkbq84f2wd63odkp7zvf.png)

---

This question can be solved using the sliding window technique:

```python
def solution(k, arr):
    window_start = 0
    while window_start <= len(arr):
        window = arr[window_start:k+window_start]
        if len(set(window)) == k:
            return window_start + 1
        window_start += 1

    return -1

if __name__ == '__main__':
    try:
        n = int(input())
        number_of_running_servers = list(map(int, input().split()))
        print(solution(n, number_of_running_servers))
    except Exception as e:
        pass
```

For every segment containing **k** number of elements, the function checks to see if the number of unique elements equal **k**.

## Conclusion

These array questions were interesting to solve. I have about 2 more unsolved questions whose solutions will be published once I am able to solve them.
