--- 
title: "The Andela challenge, GroupSort" 
description: "I didn't get to complete it because I had to do something at the house, sighs." 
date: 2020-07-01 
---

I got wind of the Andela "Crack the Code" challenge last Friday. I couldn't complete it due to some annoying issues here at the house, I could only attempt two and forgot to copy other questions to solve at my leisure time. I'll discuss my thought process in solving the first two questions I was able to solve. This is the first question.

**If you have the full questions at hand, please reach out to me via the comment section!**

> It was a priced challenge, and I actually didn't do it for the gram lmao. Just to measure how far I can solve algos, really.



The first question is very easy, although I don't think my solution was optimal tbh. Here's the problem statement:

---
## GroupSort

Given an array of integer, create a 2 dimensional array where the first element is a distinct value from the array and the second element is that value's frequency within the array. Sort the resulting asrray descending by frequency. If multiple values have the same frequency, they should be sorted accordingly.
  
Example:
  
```Python
  arr = [3,3,1,2,1]  
  # return  [[1,2], [3,2], [2,1]]

  arr = [2,1,2,2]
  
  # return [[2,3], [1,1]]
```
    
The question above indicates that it's a count and sort problem - record the frequency, and return individual arrays of the number and its frequency in a parent array sorted in descending order. However, there's another condition: **If multiple values have the same frequency, they should be sorted accordingly.**

The first test case is an example of the above highlighted condition.

## Solution

Naturally, I would store the frequencies in a dictionary ( HashMap ) and return the numbers according to their frequency or reversed, but that won't work for all cases, unfortunately.
 
So, what I did instead was store the values in a dictionary alongside their frequency, and return the values from the dictionary sorted using the frequency as the `key`. `key` in this sense means the base condition for sorting.
 
#### I don't get...

> Take for example, to return the array `[3,3,1,1,2]` according to frequency, we'll have: `[(2, 1), (1, 2), (3, 2)]`. 
> But, the question states that if there are numbers with the same frequency, return the numbers with the same frequency in ascending fashion which gives us: `[(1, 2), (3, 2), (2, 1)]]`

Here's the code:

```py{codeTitle: GroupSort.py}{numberLines: true}
def groupSort(arr):
    store = {}
    for i in range(len(arr)):
        if arr[i] not in store:
            store[arr[i]] = 0
        store[arr[i]] += 1

    return sorted(list(store.items()), key=lambda x: (-1 * x[1], x[0]))
```

#### Complexity : This runs in O(n) time and space runs in O(1)? . The sorting is O(nlogn), and the for loop runs in O(n) time. Correct my complexity if it's wrong!

In my solution above, I have a hashmap, `store` where I store the numbers and their frequencies respectively using a `for-loop`. Next, I return a list of the elements in the `store` sorted using their frequency. 

This sorting used an anonymous function as the key for sorting. `key=lambda x: (-1 * x[1], x[0])`. If you haven't gotten the trick I used for sorting, haha!

Here's what I did:

Like we all know that in negative numbers, -1 is greater than -2, so I set the frequencies to negative values for the time being ( the indexes won't be permanently negative o! ), and return the numbers based on their negative frequencies. Here is how it's done...

```python
# Original array from hashmap = > [(3, 2), (1, 2), (2, 1)]]
# The lambda function returns:

[(-2, 3), (-2, 1), (-1, 2)]

# when the sorted() function is eventually called in the call stack, we have:

[(-2, 1), (-2, 3), (-1, 2)]

```

So why do we have `[(1, 2), (3, 2), (2, 1)]` ? That's because the whole process is using the negative frequencies to sort it in the call stack and as a result, isn't modifying the values so at the end of the day, the original array is returned, **sorted**.

```
# Call stack: [(-2, 1), (-2, 3), (-1, 2)]
# Main stack (haha!), return the original array based on the indices from the call stack:

[(1, 2), (3, 2), (2, 1)]
```

### But but.. (-2, 3), (-2, 1) ?

Remember two numbers with same frequency should be returned accordingly? That's it.

[-2, 3] > [-2, 1] so the function returns [-2, 1], [-2, 3]

### Conclusion

This is how best I can explain my approach to this question. All test cases passed, I'll like to know the other solutions! Teinz