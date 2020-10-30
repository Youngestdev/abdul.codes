--- 
title: "Designing a Tic-Tac-Toe game."
description: "I was solving this design question on LeetCode, so yeah I'll talk about it."
date: 2020-10-30 
---

So I stumbled upon the tic-tac-toe design question on LeetCode and it dawned upon me that I have never worked on it or anything similar, hehe.

> _Y'know, most beginner project involve designing a tic-tac-toe and the likes._

I initially solved it with bruteforce: just wrote code to make it work. As a result, I missed the fact that using a **set** is much better since the principle of the tic-tac-toe is *all values on any of the vertical columns, horizontal rows or either of the diagonals is the same*.

So following the principle, the length of the set must be 1 and whosoever's value ( "X" or "O") is the first to be in the set is the winner.

## Let's go!

So yeah, the board is a `n x n` board so our focus is on n rows, n columns and the two diagonals: forward and backward diagonal. The board here is going to be a 2D array:

```python
class TicTacToe:

    def __init__(self, n: int):
        self.board = [[0 for _ in range(n)] for _ in range(n)]
```

In a tic-tac-toe game, a player can only place a value on an empty box. That's the only operation allowed too, interestingly. So, the method for placing a value is pretty much straight forward:

```python
    def place(self, row: int, col: int, player: int) -> int:
        self.board[row][col] = player
```

When a player makes his move, if the move leads to a win, the player is returned as the winner, otherwise 0 or None.

> **player** in the above code block is either "X" or "O", "1" or "2" or anything you deem fit.

Now to check if there's win after a player plays:

+ Check the row the player deposited his value.
+ Check the column the player deposited his value.
+ Check both diagonals.

I'll create a method `check(row, col, player)` for that. I can do this inside the `place` method but extra readability, actually.

```python
    def check(self, row: int, col: int, player: int) -> int:

        # Check the current row first
        plays_in_row = set(self.board[row])
        if len(plays_in_row) == 1 and player in plays_in_row:
            return player

        # Check the current column
        plays_in_column = set(self.board[i][col] for i in range(len(self.board)))
        if len(plays_in_column) == 1 and player in plays_in_column:
            return player

        # Check the forward diagonal i.e [i][i], [i+1][i+1]... [i+n][i+n]
        plays_in_fwd = set([self.board[i][i] for i in range(len(self.board))])
        if len(plays_in_fwd) == 1 and player in plays_in_fwd:
            return player

        # Check the backward diagonal i.e [i][~i], [i+1][~i+1]... [i+n][~i+n]
        plays_in_bwd = set([self.board[i][i] for i in range(len(self.board))])
        if len(plays_in_bwd) == 1 and player in plays_in_bwd:
            return player

        # If there's no win, return 0
        return 0
```

Like I said earlier, I'll check for a possible win after every win. So, I'll invoke this method just after the player has made a move:

```python
    def place(self, row: int, col: int, player: int) -> int:
        self.board[row][col] = player
        print(self.check(row, col, player))```
```

The full tic-tac-toe design code is now:

```python
class TicTacToe:

    def __init__(self, n: int):
        self.board = [[-1 for _ in range(n)] for _ in range(n)]

    def check(self, row: int, col: int, player: int) -> int:

        # Check the current row first
        plays_in_row = set(self.board[row])
        if len(plays_in_row) == 1 and player in plays_in_row:
            return player

        # Check the current column
        plays_in_column = set(self.board[i][col] for i in range(len(self.board)))
        if len(plays_in_column) == 1 and player in plays_in_column:
            return player

        # Check the forward diagonal i.e [i][i], [i+1][i+1]... [i+n][i+n]
        plays_in_fwd = set([self.board[i][i] for i in range(len(self.board))])
        if len(plays_in_fwd) == 1 and player in plays_in_fwd:
            return player

        # Check the backward diagonal i.e [i][~i], [i+1][~i+1]... [i+n][~i+n]
        plays_in_bwd = set([self.board[i][i] for i in range(len(self.board))])
        if len(plays_in_bwd) == 1 and player in plays_in_bwd:
            return player

        # If there's no win, return 0
        return 0


    def place(self, row: int, col: int, player: int) -> int:
        self.board[row][col] = player
        print(self.check(row, col, player)) # 0 0 0 0 0 1
```

That simple. Yes, there are much better ways to do this I know, uhm. Credit for this goes to [opeispo](https://twitter.com/opeispo). 

---

My initial solution was gibberish ( it did work but failed readability test ):


```py
class TicTacToe:

    def __init__(self, n: int):
        """
        Initialize your data structure here.
        """
        self.board = [[-1 for _ in range(n)] for _ in range(n)]
        

    def move(self, row: int, col: int, player: int) -> int:
        """
        Player {player} makes a move at ({row}, {col}).
        @param row The row of the board.
        @param col The column of the board.
        @param player The player, can be either 1 or 2.
        @return The current winning condition, can be either:
                0: No one wins.
                1: Player 1 wins.
                2: Player 2 wins.
        """
        
        # Check for a win.
        self.board[row][col] = player
        
        win = all(values == self.board[row][0] for values in self.board[row])
        win2 = [self.board[0][col]]
        for i in range(1, len(self.board[0])):
            win2.append(self.board[i][col])
    
        
        diag1, diag2 = [self.board[0][0]], [self.board[0][-1]]

        for i in range(1, len(self.board[0])):
            diag1.append(self.board[i][i])
        
        for i in range(1, len(self.board[0])):
            diag2.append(self.board[i][~i])

        if win or all(el > 0 and el == win2[0] for el in win2) or (len(diag1) == len(self.board[0]) and all(el > 0 and el == diag1[0] for el in diag1)):
            return player
        elif (len(diag2) == len(self.board[0]) and all(el > 0 and el == diag2[0] for el in diag2)):
            return player
        return 0
```

## Moving on

Whilst on the call with Ope, I thought about cancelling a visit to a row, column or diagonal that has a piece of each player. I'll take my time to work on that next month once I'm chanced - I'm curious as to how I can make that work. I don't have an idea of how to implement it just yet.

I have been doing design questions and maybe that's what I'll be doing for the next couple of weeks, it's fun. I implemented as exremely slow LRU Cache in bruteforce, fixed that with an `OrderedDict` yesterday sha. I really know I should've updated the linkedlist series, I'll fix that.

I wrote a sudoku validity checker ( erhh, idk if you get, but yeah haha ). It's a simple question on codesignal but medium on LeetCode. Interestingly, I honestly didn't know how to solve it months ago but was able to solve it on Wednesday - I think I have improved in my thinking ability, maybe. But yeah, if I find something interesting to write about, I'll. See ya!
