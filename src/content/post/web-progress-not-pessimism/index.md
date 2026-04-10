---
title: "We need web progress, not pessimism"
description: "I was recently made aware of yet another article about how frontend web development has lost its way. Everything has become too complicated. Tailwind is corrupting our youth. While there is always some truth to these sentiments, all of this negative demagoguery is a detriment to the frontend community."
publishDate: "10 Feb 2026"
updatedDate: 15 Nov 2025
tags: ["html", "css", "tailwind", "semantics", "a11y"]
pinned: true
---


## Back in my day
Twenty years ago, we lived and breathed “separation of concerns” and “the semantic web”. Tags like `<font>` and `<marquee>` were declared abominations. We all followed Tim Berners-Lee into a bright future where our web pages had structure and meaning. Anything that was purely aesthetic was siloed to our CSS, and JavaScript was our “behavioral” language. If we needed a header, we simply wrote 
```html 
<div id="header"> 
```
 and targeted `#header` in our stylesheet. Life was simple.

## The web’s awkward phase
Fortunately (and somewhat unfortunately), the web evolved. Our trusty hypertext delivery system was now a platform for productivity and creativity. Web pages were no longer documents, but full-featured, life-or-death, interactive applications. Even pages that were still just delivering static text were now clothed in decadent layouts previously only possible in print. We created JavaScript libraries and frameworks to drive the lumbering engines of our complex state machines.

## Name-calling
Our designs now needed to adapt to varying viewport sizes, dynamic content, user needs and preferences, device and network conditions, and more. Thankfully, we were gifted elements like `<nav>` and `<footer>`, as well as ARIA roles and attributes like `role="tab"` and `aria-label="Close"` to aid us in our pursuit of semantic ideals. Despite all this, we still found ourselves writing `class="article-wrapper"` and `id="nav-left"`

The truth of the matter is that **user agents do not really care about supposedly semantic class names** (with a few standard exceptions like microformats). If they did, we would not need `<header>` or `<article>`. Class names in our markup are ultimately hooks for our CSS (and JavaScript incidentally), which makes them fundamentally presentational. For this reason, comparing nonsemantic class names to nonsemantic elements like `<center>` is a false equivalence.

It is this realization that led some of us to create class names that represented visual building blocks like `.card` We could eliminate repeated CSS that was previously applied to elements that were visually similar, despite being semantically different. This ideology is the foundation of component-like CSS frameworks, such as Bootstrap and Semantic UI. And when `.card-shadow` and `.btn-shadow` also felt too repetitious to some of us, we factored out classes like `.shadow`, which spawned Tachyons and eventually Tailwind. However, are these trendy utility classes really a better approach?

## Who is wrong and who is right?
Unlike many of the hot takes, I do not think there is a timeless “proper” way to write HTML and CSS. I think we should simply strive for these goals:

- Make things as accessible as possible to our target users. This means using semantic HTML, adhering to the ever-changing standards as well as we can manage, and educating ourselves on the obstacles before us.
- Keep things as efficient and simple as we can. Obviously, many sites ship too much JavaScript/CSS/HTML, but the requirements of the real world are more challenging than the generalizations and contrived examples that are often peddled by curmudgeons.
If you think Tailwind creates an ugly, confusing “class soup”, that is perfectly understandable. If you think clientside routing has no place in your project, you may be right. Your choice of React over Vue, tabs over spaces, and so forth are all valid choices. The right choice is the one that allows you or your team to deliver on your goals.

To continue to drive progress, we need to drop the negativity, the tribalism, and the pessimism. Tools, frameworks, and conventions will always change, and these changes will require us to be both cautious and open-minded. The heroes of the web are those who unite to forge the standards and features that we so clearly need.