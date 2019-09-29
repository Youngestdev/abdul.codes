---
title: "30 Days Of C[ss]ode"
description: "A simple intro about my recent code journey."
date: 2019-09-29
---

Firstly, this is a new blog - a smooth simplistic markdown blog. Just what I wanted.

So basically, I'll be writing about my code journey and perhaps, other things and most especially my new challenge - 30 Days of Code.

## 30 Days of Code ?

I think I should have said 30 days of **CSS** because I don't know CSS. It's weird coming from a dev who's been coding for years eh ? - Mehn, I don't like to lie lol. I've rejected quite a lot of job offers due to my inability to write CSS. I won't like to disappoint my client :grin:.

#### So I decided to embark on a cool journey

I decided to level up my FE skills from [next.tech](https://next.tech) because of their interactive cool lessons. It's the second place I've seen with that cool interactivity apart from [Codecademy](https://codecademy.com) and FCC. Luckily, my sensei is helping me out by reviewing and giving me feedback - that I'm super grateful. Even resizing and remodifying this blog is part of my challenge - most especially fixing the display for mobile which is the greater lesson I've learnt so far.

## Progress so far ...

So basically, the major thing I learnt is building for mobile interfaces and using the chrome developer tool as my working partner since it has a variety of screen sizes.

I knew about media queries and actually never understood it well because I wasn't a frontend developer which was quite wrong. It's part of responsive web design basics.

```css
@media ...
```

The media query I used was for screens and I used it in setting parameters for `min-width` and `max-width`.

An example:

```css
/* for styles with the specified minimum width */
@media only screen and (min-width: xpx) {
    background-color: #000000;
    color: blue;
}
```

and

```css
/* for styles with the specified maximum width */
@media only screen and (max-width: ypx) {
    background-color: #FFFFFF;
    color: pink;
}
```

The first example specifies the background color and text color for screens with minimum width of `xpx` and the same for screens with maximum with `ypx`. In essence, the minimum width means for screens that pixel or more and maximum width means for screens that pixel or less.

The other things I learnt which aren't new to me actually :

- Box model
  + Margin
  + Border
  + Padding
  + Content itself.
- Sizing
    - Width
    - Height

### Projects ?

Well, I store my little projects in a [30 Days of Code repository](https://github.com/Youngestdev/30daysOfCode) and you can get a live preview here - [Abdul's 30 Days of Code](https://30doc.abdul.codes).

Apologies, I suck at color rhyming. The little sense it makes is as a result of my Sensei's guide, lol. I still have little adjustments to do there but of course, my project view for mobile and desktop is balanced, haha!

##### Until then!
