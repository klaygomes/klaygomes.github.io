---
layout: post
topic: Low-level
title: "mini-painel: A Hobby Log About Talking to a Tiny USB Screen in C"
excerpt: A work-in-progress hobby project in C that drives a cheap 3.5-inch USB display from a Mac. What works today, what I'm still poking at, and how to build it.
modified: 2025-01-20
tags: [c, embedded, serial, macos, cairo, hobby]
comments: true
---

{% include toc.html %}

**mini-painel** is a hobby project of mine, and it is not finished. The idea is simple: take one of
those cheap 3.5-inch USB screens and turn it into a small status panel for the desk, showing things
like build status, alerts or who is on call, updating in the background with no browser tab
involved.

This post is a log of where it stands. What already works, what I'm still exploring, and how you
can build it and play with it yourself. The code is on
[GitHub](https://github.com/klaygomes/mini-painel), written in C99.

## It started with six bytes

The very first commit was a single `main.c`. It opened the serial port at 115200 baud (bits per
second), configured it in *raw mode* (no line buffering, no echo, the terminal does not touch your
bytes) and sent this:

{% highlight c %}
char buf[6] = {0x45, 0x45, 0x45, 0x45, 0x45, 0x45};
{% endhighlight %}

That is the **HELLO** handshake. You send six bytes of `0x45` and the display answers with six
bytes of its own, which tell you which model you are talking to. Everything else was built on top of
that small conversation.

Here is the part I like the most: from the computer's point of view, this screen is not a monitor.
It shows up as a serial device (something like `/dev/tty.usbmodem...` on macOS), the same kind of
port you would use to talk to a microcontroller. If you have read my STM32 posts, this will feel
familiar: read the protocol, pack bits in the right order, and respect the timing of the device.

## What works today

At this point the repo can:

- **Find and open the screen** on its own, by scanning `/dev/tty.usbmodem*` and picking the first
  device that answers HELLO.
- **Control the display:** brightness and orientation. The XuanFang code path also knows how to
  set the RGB LED on the back of the Flagship model.
- **Draw a dashboard** out of rows of components, using Cairo (a 2D drawing library) to render
  them. There are components for deploys, CI status, alerts, outages, on-call, sprint progress, PR
  review queue, sparklines (tiny line charts without axes), error rates and SLA gauges.
- **Split content into pages** when it does not fit on one screen, and cycle through them.
- **Run tests without hardware**, using a fake serial backend. CI builds and runs them on every
  push, including a pass with AddressSanitizer and UBSan, compiler tools that catch memory and
  undefined-behavior bugs at runtime.

## A few details from under the hood

Some things that were fun to get right, all written down in the repo's `doc/` folder:

- **Pixel format.** Your code draws in RGB888, 8 bits per color channel, 3 bytes per pixel. The
  screen wants *RGB565*, which squeezes a pixel into 16 bits (5 bits red, 6 green, 5 blue). The
  library converts before sending.
- **Packed commands.** A command is a 6-byte frame where the x/y coordinates are packed across byte
  boundaries, with the command byte last. Bit shifting, the classic embedded pastime.
- **Chunks and pauses.** Bitmaps go out in chunks of 2560 bytes (320 × 8 rows), which avoids USB
  buffer stalls on macOS, plus a 50 ms pause after each bitmap to avoid corrupted frames.
- **Inverted brightness.** On the protocol the current build uses, `0` means brightest and `255`
  means darkest. The public API hides that and takes a plain percentage from 0 to 100.

## Building it

You need CMake 3.10 or newer, pkg-config, Cairo and a C99 compiler. The serial code uses POSIX
termios and the README lists macOS as the target. On a Mac:

{% highlight sh %}
brew install cairo
git clone https://github.com/klaygomes/mini-painel
cd mini-painel
mkdir build && cd build
cmake ..
make
{% endhighlight %}

To run the tests, which also write one image per component into `bin/` so you can look at them:

{% highlight sh %}
cmake .. -DBUILD_TESTING=ON
make
ctest --output-on-failure
{% endhighlight %}

## Using the library

The API is small: create a dashboard, add rows of components, render a page and push the frame to
the device. This is the main loop from `examples/demo.c`:

{% highlight c %}
dev = panel_open_auto();
if (!dev)
    fprintf(stderr, "No device found; running in headless mode.\n");
else {
    panel_set_orientation(dev, XF_ORIENT_LANDSCAPE);
    panel_set_brightness(dev, 80);
}

page = 0;
while (1) {
    const uint8_t *frame = NULL;

    if (dashboard_render_page(dash, page, &frame) < 0) {
        fprintf(stderr, "dashboard_render_page failed\n");
        break;
    }

    xf_bitmap_t bm = {.x = 0, .y = 0, .width = DISPLAY_W, .height = DISPLAY_H, .rgb888 = frame};
    if (dev && panel_display_bitmap(dev, bm) < 0)
        fprintf(stderr, "panel_display_bitmap failed\n");

    printf("Page %d / %d\n", page + 1, page_count);
    sleep(PAGE_INTERVAL_S);
    page = (page + 1) % page_count;
}
{% endhighlight %}

Notice that the demo keeps running without a screen, which is handy for working on the layout
before plugging anything in.

A component is a plain struct with a `render()` callback that fills a pixel buffer, and an optional
`fetch()` callback that refreshes its data before each frame. Three macros create them, depending on
whether the component is static, reads data you own, or fetches live data:

{% highlight c %}
xf_component_t logo  = XF_COMPONENT(render_logo);
xf_component_t label = XF_COMPONENT_DATA(render_text, &my_text);
xf_component_t clock = XF_COMPONENT_LIVE(fetch_time, render_clock, &time_ctx);
{% endhighlight %}

## What I'm still exploring

This is where the "work in progress" part really shows:

- **Which protocol, which screen.** The README talks about the XuanFang 3.5" display (Rev B or
  Flagship), and the repo has code for that protocol. But the project notes are written against a
  display that identifies as a UsbMonitor 3.5" and speaks what they call the Turing Rev A protocol,
  and that is what the current build uses. Both implementations live side by side for now.
- **Driving it without C.** There is a JSON command API, where you send an array of commands like
  `{"op":"row.add", ...}` and get a JSON reply back, plus a small WebSocket daemon that accepts
  those commands and pushes each rendered frame to the screen.
- **Feeding it real data.** The `playground/` folder has two experiments in Python: one polls
  GitHub through the `gh` CLI for PR and build data, the other shows Claude Code session state using
  hook scripts. The folder name says it all: these are experiments, not features.

Some of the docs also lag behind the code (the getting-started page still shows an older
`panel_display_bitmap` signature), which is a good sign that things are still moving.

## Try it

If you have one of these screens in a drawer and enjoy this kind of tinkering, give
[mini-painel](https://github.com/klaygomes/mini-painel) a try. Just keep in mind it is a hobby build
and rough around the edges. If you get it running on a different model, or have an idea, open an
issue or leave a comment below. I would love to hear about it.
