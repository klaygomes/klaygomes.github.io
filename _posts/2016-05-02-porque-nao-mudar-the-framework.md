---
layout: post
title: Why we are staying with Microsoft's .NET stack
excerpt: Why I decided not to switch stacks when the opportunity came up inside the company.
modified: 2016-05-05
tags: [net, governance]
comments: true
---
{% include toc.html %}

This year, we had the opportunity to take a look at, and decide whether it would be viable, moving from Microsoft technology to a Linux environment using Python. I decided to write this article as a summary of our meetings and of why I decided to keep using the Microsoft stack.

## Technical motivations.

**Advanced concepts about scalable applications are abstracted away from developers**. In the .NET framework, we have native support for multithreading and parallelism through syntactic sugar (async and await). Programmers don't need to know about these more advanced techniques to make use of them. In Python, on the other hand, the project's architecture and infrastructure need to be written with this in mind from the start.

C#, being a language compiled at runtime, is by nature **faster than interpreted languages**. Compared with Python, it can be up to 50,000% faster.

**This can make the application harder to maintain**, since to work around this problem, Python allows CPU-heavy operations to be written in C++, which requires a professional who knows that language and the implications of its interoperability.

**It is easier to maintain applications written in typed languages**. With a strongly typed language, even though productivity while developing new features may suffer compared with dynamic languages, this time is paid back during maintenance. A good part of development costs happens during maintenance; dynamic languages require programmers to be more disciplined and to know the environment they are developing in well, so that they produce more robust and easier-to-maintain applications.

**Compilation as a code quality tool**. One of the advantages of interpreted languages over compiled ones is the cost of compilation during the development workflow. However, it can turn into a disadvantage, since errors like syntax errors, or calls to properties or methods that don't exist, are only caught when the code runs, which demands more effort on test coverage and, in the end, increases the development cost.

**Team maturity**. Today our team has great professionals with an excellent background in the Microsoft architecture; with a migration, we would need to adapt and wait for the learning curve. Remember: your team is only as good as your worst programmer.

## Cloud infrastructure

Both Google's and Microsoft's solutions are excellent, highly scalable, cheap, and secure. Microsoft's solutions have a price advantage for some offerings, for example: for a micro virtual machine, the minimum price charged on Google Cloud is around 130 dollars (450 reais), while on Microsoft's platform it is 17 dollars. There is also the location of their data centers; Google doesn't have servers in Brazil yet. However, it is possible that commercial agreements or implementation details make up for the amounts paid. In the current market, there are no advantages or disadvantages that decide the choice of one over the other; they are all integrated with their respective development environments, and both let you publish entire applications with one click.

## Result

The new project starts in July, and we are going to build it in .NET and C#. The version chosen for development will be 4.6.1, MVC 5 / WebAPI 2, using SignalR.

Right now, my team and I are planning the architecture, developing the infrastructure, and validating it on top of sketches with complex use cases. In the next articles, I will post updates with details on how it is turning out.
