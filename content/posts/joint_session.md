--- 
title:  "Joint Session, Tomiwa & I"
description: "Mock interview, gist and vibes."
date: 2020-07-07 
---

Last saturday, Tomiwa ([BlackDev](https://twitter.com/AdesanyaTomiwaa)) and I had a joint session. Well, I was conducting a mock interview for him, but it ended up a joint discussion at the end. It was fascinating as we got to discuss and solve questions - in the course of that, the longest sequence question was solved.

In the mock interview, he solved a simple calculation question, then a backtracking question gotten from the Andela crack the code challenge. He also solved Codility's frog jump question and then we discussed optimisations on both time and space.

He's a badass, tbh.

Here is the link to a GitHub gist that houses the dicsussion - [Click me.](https://gist.github.com/Youngestdev/0d3eaf072d8004a97897810682859e19)

## Longest Sequence

This question is a combination of both the longest increasing and decreasing sequence. I thought of the question whilst interviewing him, there's a similar stock question ( I don't know the name ). However, here's the problem statement I wrote on it and the code written by Tomiwa, and I. 

> Real credit goes to Tomiwa! - Baba went from not knowing dynamic programming to solving it, fear blockchain boys.

#### Problem statement
    
Given an array of integers, return the length of the longest sequence. This sequence can be in ascending or descending order. Example:

```{codeTitle: Examples}
Input: [1,2,3,0,6,5,4,3,2,1]
Output: 6. [6,5,4,3,2,1] is the longest sequence

Input: [1,2,3,4,2,1]
Output:  4. [1,2,3,4] is the longest sequence

Input: [1,2,2,1]
Output:  2. [1,2] or [2,1] is the longest sequence
```

Since this question is from the longest * family, it's a dynamic programming question. This question can be solved in many other ways, however, the optimal solution is the dynamic programming approach.

### Solution

As stated earlier, to find the longest sequence, we find both the longest increasing and decreasing then return the maximum length. We'll create a 2D array to store our result as we calculate the length of the sequence as we walk through the original array. ( I might try to sketch something if it's needed - for now, no)

In JavaScript (Credits to Tomiwa) :

```javascript {codeTitle: LongestSequence.js}{numberLines: true}
function sequence(arr){
    // Create a 2D array and fill it with 1s => [[1,1], [1,1], [1,1]]
    var dp = new Array(arr.length);

    for(var i = 0; i < dp.length; i++){
        dp[i] = new Array(2)
        dp[i].fill(1)
    }

     // Loop through the array.
    for(var i = 0; i < arr.length; i++){
        for(var j = i-1; j >= 0; j--){
            // Perform the longest Increasing sequence and store the result
            // in the first part of the array.

            if(arr[j] < arr[i]){
                dp[i][0] = Math.max(dp[j][0]+1, dp[i][0]);
            }

            // Perform the longst decreasing sequence and store the result
            // in the second part of the array.

            if(arr[j] > arr[i]){
                dp[i][1] = Math.max(dp[j][1]+1, dp[i][1]);
            }
        }
    }

    // Return the max value from both arrays.
    
    var maxRow = dp.map(function(row){ return Math.max.apply(null, row); });
     return Math.max.apply(null, maxRow)
}
```

Whew. That's a lot of code lol. In Python, we have it as:

```py {codeTitle: LongestSequence.py}{numberLines: true}
def longestSequence(array):
    dp = [[1 for _ in range(len(array))] for _ in range(2)]
    for i in range(len(array)):
        for j in range(i - 1, len(array)):
            if array[j] < array[i]:
                dp[0][i] = max(dp[0][j] + 1, dp[0][i])
            if array[j] > array[i]:
                dp[1][i] = max(dp[1][j] + 1, dp[1][i])

    return max(max(dp[0]), max(dp[1]))
```

The code runs in O(n^2) time and O(n) space.

## Conclusion

Tomiwa & I had a very good time discussing questions and stuff. We had a joint session yesterday (6th of July) again, I'll find time to write on what we did - mostly talks, whines and solving.

The longest sequence is a very interesting question, and I'll be publishing my backtracking solution ( didn't pass all test cases because well, it's slow ) for the second question in the Andela challenge soon.
