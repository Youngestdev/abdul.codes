--- 
title: "Looks Like I've found something new, haha!"
description: "I'm very unstable when it comes to doing things, sadly. I want to write quick code and see it work asap." 
date: 2020-09-19 
---

So last week I participated in my first ever ( I did dabble around Kickstart this year sha) competitive programming contest. I know about CP and how the athletes in that sport as badasses at solving problems. You can view my 2* profile [here](https://codechef.com/users/Youngestdev1) ( raises shoulder ).

So, Chidi actually made a tweet about having a discord channel for problem solving lovers where we can connect and do one or two sha. The tweet had big men names in it. Fortunately, Ope commented with a link to an ongoing contest on CodeChef. I have never participated in one so I decided to give it a try since I don't have anything to do...

Sha sha, I participated oh. Made a lot of mistakes, but solved 2 completely and 1 partially... Fair enough, given the fact that I hadn't studied or solve problems for weeks. The first question was actually easy and it took me about a day to figure out the trick. At that point, I knew I have to read question statements well and not just dive into bruteforce solutions, sometimes. It was a nice experience honestly, I think I'll pick it as a new hobby.

### New hobby? Wetin you sabi?

Bruh. Idk anything but yes, lmfao. Since Michael's treasure game, I've been happy about building code that does algorithmic work. Well, I write code to solve problems on LeetCode but nah, this looks different. I don't know why, uhm.

I participated in a code forces contest today and was only able to solve the [first problem](https://codeforces.com/contest/1419/problem/A), haha! I had to read the problem statement carefully to figure the simple answer... See the code:


```py
if __name__ == '__main__':
    try:
        T = int(input())
        for _ in range(T):
            n = int(input())
            turns = [int(i) for i in str(input())]
            if len(turns) == 1:
                if turns[0] % 2 == 0:
                    print(2)
                else:
                    print(1)
            else:
                if len(turns) % 2 == 0:
                    print(2)
                else:
                    print(1)
    except Exception:
        pass
```

I initially was just doing bruteforce until I read the statement, Ope sent me a link to how to design solutions for questions and it has actually helped in my model of thinking. I'm also a slow illustrative learner that'll fail at speed test, well.

### So competitive programming ?

Honestly, I had this in mind since 2018 when I was in a team that participated in Google's HashCode. I ran away when I saw that most of the questions are mathematics related. Although that is true, not all. It's more of logic and general problem solving ability but participating in the code chef contest has rekindled my interest. As a result, I'll be participating occasionally in these contests! I'll take my time to study the essentials and excel in it haha!

Interestingly, there are actually good Nigerian competitive programmers! I'll try to reach them from various sites. I think we should engage young brilliant mathematicians in the field of competitive programming..


## Conclusion

This blogpost is more like a thought between me and my head. I own them both, I know lol. However, that's that abegii.










