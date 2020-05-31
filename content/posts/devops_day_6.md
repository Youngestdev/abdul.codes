---
title: "Beginning DevOps - Day 6"
description: "Never use sudo when you're tired."
date: 2020-05-31
---

In the [previous post](/read/beginning-dev-ops-day-5), I was trying to get my ssh to work with ansible.

## Today

So today, I decided to continue with automation with ansible. I explored the ansible-playbook package and created an inventory, roles and a playbook ultimately.

In the book, I was to automate two tasks:
+ Create users
+ Install some packages.

I had difficulties setting up the ssh again but well, I was able to fix it. The creating users tasks required the use of `sudo`. I mean, `sudo` is actually a bastard - shey it can't revert my mistakes ni.

## Creating users & Doom...

My default user on my machine is **Youngestdev**, in the book, we're to create a user to have its own enviroment, ssh keys etc... I was like well, let's get to it. I was actually tired ( sleep deprived due to one or two things ) and I wanted to just finish the chapter so I can begin a new one tomorrow.

Mumu me went to use my default user name as the user to be created giving it new UID, GID, and file permissions.. I didn't realise until I woke up - **I had granted a read-only permission to my disk"**.

## Sighs.

I had shutdown already and when I restarted the laptop, I couldn't open applications except the terminal. I had to reinstall my OS, luckily, I don't have any important data ( I think.. ) as it's a fresh installation.

Now, I have a new OS installed and didn't download that book again for these reasons:
+ Outdated information
+ Lack of cautionary messages
+ Not beginner friendly

I'll just tread carefully with these books and use more of documentations tbh, I should've known better than to run `sudo` carelessly but, mistakes happens and that's a mistake I def won't make again.. hopefully.

## Next steps

I'll set up everything again - ssh, docker, ansible. I'll be taking my time more carefully to study books before executing commands and run to the documentation as those are the materials that have aided in the last few days.

I got a new book, and I'll take my time to review it before I decide to either keep it or trash it.

--- 

Thanks for reading, Etin!
