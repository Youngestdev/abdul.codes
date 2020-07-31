---
title: "Arrays: Looping N-dimensional arrays"
description: "In this post, I'll talk briefly on arrays and looping them." 
date: 2020-07-22 
---


Arrays are mutable data structures where you can store variables. These variables aren't limited to the array itself. Most of its operations are linear time except for look up, which is constant time.

A few days ago, a friend who's learning Python asked for a review and some explanations on printing the values from a 2D array. So I thought, why not even jot it here..

---

So, before moving to the main topic, I'd just briefly drop these known facts:

1. A N-Dimensional array has a space complexity of O(n<sup>N</sup>).
2. Looping a N-Dimensional array has a time complexity of O(n<sup>N</sup>) too.

With the known facts above, it is safe to say that a 3-D array's element will be printed by 3 loops since the first element can be accessed through array[0][0][0]. I actually haven't come across arrays of 4-D and above, but they could exist. They might, actually.

## Looping through arrays.

In this section, I'll be discussing how to loops N-dimensional arrays.

### Looping through 1-D array.

A 1-Dimensional array can be looped in linear time:

```python{codeTitle: Looping through a 1-D array I}
arr = [1,2,3,4,5]

for idx in range(len(arr)):
    print(arr[idx]) # idx here stands for the index.

# 1,2,3,4,5

```

I could also do:

```python{codeTitle: Looping through a 1-D array II }
arr = [1,2,3,4,5]

for numbers in arr:
    print(numbers)
    
# 1,2,3,4,5
```

However, the second approach isn't suitable for all cases. In the case of a 2-D array, we cannot use that approach to print out all the numbers. 
> I **personally**, discourage the use of the `for-in` approach in large programs except some very simple use cases. The keywords `is` and `in` have special use cases.

### Looping through a 2-D array.

A 2-Dimensional array cannot be looped in linear time. Say, we apply the loop code from the previous section to the 2-D array below:

```python{codeTitle: }
arr = [[1,2,3], [4,5,6], [7,8,9]]

for idx in range(len(arr)):
    print(arr[idx])
    
# [1,2,3], [4,5,6], [7,8,9]    
```

You weren't expecting the values I bet! If you were, haha!

Like I said earlier, arrays can store arrays too. So, we have to loop the array twice: the first loop is to bring the inner arrays from the parent array then the next is to print out all the children in the array. Here:

```python{codeTitle: Looping through a 2-D array}
arr = [[1,2,3], [4,5,6], [7,8,9]]

for idx in range(len(arr)): # Bring out the sub-arrays
    for children in range(len(arr[idx])): # Loop through one sub-array at a time.
        print(arr[idx][children]) # arr[0][0]..arr[0][2], arr[1][0]..arr[1][2]
        
# 1,2,3,4,5,6,7,8,9    
```

That's easy, confusing to beginners too. I had never given that a thought too sha.

I'll move on to the last one.

### Looping through a 3-D array.

> On the flip side, the example below may not be a perfect example of a 3-D array. I'm just citing an example, please.

Here, we'll use 3 loops to get the children. One for the grandparent, One for the parent and the last for the children. Here:


```python{codeTitle: Looping through a 3-D array}
arr = [[[1,2,3], [4,5,6], [7,8,9]]]
for grandparent in range(len(arr)):
     for parent in range(len(arr[grandparent])):
       for child in range(len(arr[grandparent][[parent])):
         print(arr[grandparent][parent][children])

# 1,2,3,4,5,6,7,8,9
``` 

There it is, simple and can be confusing. How about a 6-D array? Let me see your code in the comments if you read this, thanks! Do point me to any mistakes or corrections you think I should fix/make. Thanks again :)




