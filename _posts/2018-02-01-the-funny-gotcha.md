---
layout: post
title: The small gotcha that make fell I know something 
excerpt:  The moment I realized that I'm starting getting the linux felling
modified: 2018-02-01
tags: [ti-life english]
comments: true
---

Did you ever remember when you realized that `[` is a built-in command in **bash**, like `echo`, `cd`?

Well, we as humans tend to assume things, so I did for a long time. As I came from Windows, and my programming experience is with high-level languages, in the beginning, I just got the necessary to be able to do my job as a frontend engineer.

So I learned how to create branch decisions using `if`, which is a **shell keyword**. I connected it with what I had learned in the past, associating `if [ commands ];` as syntax constraint like the other languages and never worried about what I was doing; after all, I had my work done at the end.

As time went by, I realized that I had to learn more about this language; well, you know, it is impossible to work with Linux *effectively* without knowing it. 

So I decided to start from scratch, assuming I know **nothing** about bash, it was a great decision, because with my mind open I started watching and reading basic tutorials; as a side note: it is sad how there is bad content on the internet, you have to take much care when you decide to learn new things because the chances you got misleading content(or just wrong) is high.

Well, I was in luck when I found the [Bash Guide](http://mywiki.wooledge.org/BashGuide), written by LHunath and GreyCat. They do a great job explaining what you need to know effortlessly. 

They were the first content where they take a step to make it clear that it is a command and it needs the parameter `]` as the last one.

See what they say:

> `if` executes the command `[` (remember, you don't need an `if` to run the `[` command!) with the arguments `a, =, b` and `]`. `[` uses these arguments to determine what must be checked. In this case, it checks whether the string a (the first argument) is equal (the second argument) to the string b (the third argument), and if this is the case, it will exit successfully. However, since the string "a" is not equal to the string "b", `[` will not exit successfully (its exit code will be 1). if sees that `[` terminated unsuccessfully and executes the code in the else block.
> The last argument, "**]**", means nothing to `[`, but it is required. See what happens when you omit it.

> (credits http://mywiki.wooledge.org/BashGuide/TestsAndConditionals)

Until that moment, everything that I thought weird about bash started making sense. Before that, I never realized why I couldn't write things like `if[$1 -lt 10]` (note I didn't use spaces) or execute commands inside the brackets like `if ["$1" -eq $(cat file) ]`.

The simple fact that I know that `[` is a command, like any normal bash program, and it *expects* parameters to be passed, made me never make this kind of mistake again. 

I was so surprised by this little thing that I said to me even if I write anything to my blog again; it should be about it. Well, years later, here am I :)

And you when you ever realized that `[` is a command?