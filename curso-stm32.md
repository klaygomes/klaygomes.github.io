---
layout: post
title: Advanced STM32F1 course
tags: [course, STM32F1, arduino, embbeded, make, vscode]
modified: 2022-10-16
comments: true
---
{% include toc.html %}

This course is for you if you want to take a step forward in your learning, or if you are already experienced and want to understand more about free tools and how they are used in big open source firmware projects.

> **Heads-up:** the video lessons are recorded in Portuguese.


## Schedule

New lessons are published every week.

## Course material

[Click here](/stm32-material.zip) to download the course's support material.


## Course content

Watch the published lessons below and subscribe to the [course channel](https://www.youtube.com/channel/UCMw-yIC0Mib2PBNHki5Z3wg) to be notified when new lessons come out!

<details open>
  <summary><h3>1. Introduction</h3></summary>
  <p>
    Learn how to program an STM32F1x using VSCode and GNU tools like Make, GDB and the Arm Toolchain. We will also teach you about CMSIS, HAL and AL, and how to find information in datasheets.
  </p>
  <iframe loading="lazy" src="https://www.youtube.com/embed/EBRhNbFfEUM" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>
  </iframe>
</details>

<details open>
  <summary><h3>2. Getting to know the tools</h3></summary>
  <p>
    In this video I go through the tools we will use in our course. You will get to know GNU Make, GDB, OpenOCD and the GNU ARM Embedded Toolchain. You will also understand what each one does and how they can be used.
  </p>
  <iframe loading="lazy" src="https://www.youtube.com/embed/sly3cELme8c" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>
  </iframe>
</details>

<details open>
  <summary><h3>3. Installing the tools using the console</h3></summary>
  <p>
    In this lesson you will learn how to install the GNU tools and OpenOCD from the console using package managers: Chocolatey for Windows; Brew on Mac and Linux. At the end we show how to download CMSIS and our support material.
  </p>
  <iframe loading="lazy" src="https://www.youtube.com/embed/ZQlmDtA8Cjc" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>
  </iframe>
</details>

<details open>
  <summary><h3>4. Creating the project structure</h3></summary>
  <p>
    In this lesson I explain how to create the initial directory structure of our project, plus more information about the files provided by CMSIS.
    We are very close to creating our hello world for the bluepill with the stm32f103.
  </p>
  <iframe loading="lazy" src="https://www.youtube.com/embed/zlHsXD-Auek" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</details>

<details open>
  <summary><h3>5. Creating your first program</h3></summary>
  <p>
    Improve the quality and size of your code by programming with only registers and CMSIS, without using STM32CubeMX. 
    In this video we configure GPIO C in Push-Pull mode to turn on the LED on pin PC13 of the blue pill board.
  </p>
  <iframe loading="lazy" src="https://www.youtube.com/embed/YPVz3nV1ID4" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</details>

<details open>
  <summary><h3>6. Automating tasks with Make</h3></summary>
  <p>
    In this video, we show how to automate everything with Make. I will cover how to use Make to automate our project and manage its dependencies; we also take the chance to teach about GCC and how to use it for embedded software development.
  </p>
  <iframe loading="lazy" src="https://www.youtube.com/embed/jgUuABfnuGM" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</details>

<details>
  <summary><h3>7. What is GCC and why do I need to know it? </h3></summary>
  <p>Coming soon.</p>
</details>

<details>
  <summary><h3>8. GDB, the number 1 debugger!</h3></summary>
  <p>Coming soon.</p>
</details>

<details>
  <summary><h3>9. OpenOCD, the jack-of-all-trades of electronics!</h3></summary>
  <p>Coming soon.</p>
</details>
