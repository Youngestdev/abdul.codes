--- 
title: "Generating Prime Numbers in A Range of N Numbers"
description: "I just noticed interestingly, that prime numbers are basically +2 of the previous ones with exceptions."
date: 2021-12-08
---

## Introduction

Okay, so this method of generating prime numbers might be common knowledge, but I just thought of it and implemented it myself.

If you know me to an extent, you might have seen me blabbing about **prime numbers**. I think prime numbers are fascinating for a reason I'm not sure about. As poor as I am in the field of Mathematics, numbers are always fun to play with as I have a habit of trying to create common relations between a set of numbers. This is a major reason why I liked Arithmetic and Geometric progressions in secondary school.

There are a couple of standard and intelligent algorithms on prime numbers. I personally have used the **sieve of eratosthenes**, and it's a brilliant one. I like the intuition behind it and as I write this, I can see how the sieve of eratosthenes is impressive and runs in half the time of my own. Will that stop me? No 👍🏿


---

I was in a conversation earlier today with my friend, Yussuf. We were talking about prime numbers, and I mentioned how the next prime should be able to be gotten from the previous ones. That didn't work and instead, we noticed a pattern - I bet everyone notices it's a series.

The series *1,3,5,7* had a common difference of 2 until *11*. As a result, it wasn't a straightforward one as one would think. But hey, 2 is the common factor and negates only when the said number is **even** or a multiple of **3,5 and 7**.

## What is a prime number?

A prime number is a natural number greater than 1 that is not a product of two smaller natural numbers - Wikipedia.

A prime number is essentially odd ( except 2 which I don't count as a prime sha) and can not be divisible by the common odd ~~prime~~ divisors: **3, 5 and 7**. So, to generate the number of primes in a range of **N** numbers, I have the algorithm:


```text
Find-Primes-In-Range-Of-N(N):
    Primes = [1,2,3,5,7] // Store the prime numbers here.
    Primary-Divisors = [3,5,7]
    
    If N <= 7:
        Return Primes // Since we already initialized the primes array for a range of 1..7
    
    For I -> N:
        If IsOdd(I):
            Truth-Table = []
            For Div in Primary-Divisors:
                Remainder = I % Div
                Truth-Table.add(Remainder)
            If All elements in Truth-Table > 0: // Means that's a prime number
                Primes.add(I)
    Return Primes
```

Complimentary `IsOdd` function:

```text
IsOdd(Number):
    If Number % 2 > 0:
        Return True
```

The pseudocode pretty much gives an idea of the algorithm. In my head, I find it basic and anyone could've thought of this and won't be surprised if this is out already. I find it exciting that I thought of this, and it worked, haha.

In Python, the algorithm implemented is:

```python
def is_odd(number):
    return number % 2 > 0


def print_primes_in_a_range(n: int):
    primes = [1, 2, 3, 5, 7]
    primary_divisors = [3, 5, 7]
    
    if n <= 7:
        return primes
    
    for i in range(7, n):
        if is_odd(i):
            truth_table = [i % div for div in primary_divisors]
            if all(element > 0 for element in truth_table):
                primes.append(i)
    return primes
```

I initiated the primes array to contain the basic odd divisors. Every odd number is divisible by at least one of **3, 5 or 7**.

## Summary

I will use this in any situation I can. I find this exciting and will tinker on how to make this a bit better. I ran the function for a values of n from 7 to 10000. Here's the graph:

![Matplotlib graph](https://tiny-img.com/images/custom-uploads/optimized/graph.png)

Here's a Google Colab link: [https://colab.research.google.com/drive/1l6XtulgHAO00Zw2VWYAoChdGbajyA5mE?usp=sharing](https://colab.research.google.com/drive/1l6XtulgHAO00Zw2VWYAoChdGbajyA5mE?usp=sharing)

---

Yes, what's the complexity of this algorithm space wise and time wise? Tell me.