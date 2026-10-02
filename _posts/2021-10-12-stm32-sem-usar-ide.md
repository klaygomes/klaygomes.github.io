---
layout: post
topic: Low-level
title: Free tools for embedded development
excerpt: A detailed step-by-step guide on how to install free tools for Cortex-M development
tags: [make, openocd, gcc, gnu, choco]
comments: true
---

{% include toc.html %}

Below is the step-by-step you need to follow to download the tools required for development on
Cortex-M controllers. In this article I mention some information specific to STM, but the guide
works for any vendor.

## Arm Embedded Tool Chain

It contains the set of tools needed to validate, test and compile programs developed for 32-bit
Cortex processors (the Cortex-M, Cortex-R and A models).

### GNU/Linux 

Download the latest version available on the [official site.](https://developer.arm.com/tools-and-software/open-source-software/developer-tools/gnu-toolchain/gnu-rm/downloads)
Preferably, save the file in the `/usr/share` directory.

Once that is done, extract the files and delete the compressed file:

```
sudo tar xjf gcc-arm-none-eabi-your-version.bz2 -C /usr/share/
rm gcc-arm-none-eabi-your-version.bz2
```

After that, you should create symbolic links so these programs are available across the whole
system:

```
sudo ln -s /usr/share/gcc-arm-none-eabi-your-version/bin/* /usr/bin/
```

You may also need to install some additional tools, like `libncurses` and `libtinfo`.

```
arm-none-eabi-gcc --version
arm-none-eabi-g++ --version
arm-none-eabi-gdb --version
arm-none-eabi-size --version
```

To check the installation, open a new terminal window and type:

```
arm-none-eabi-gcc --version
arm-none-eabi-g++ --version
arm-none-eabi-gdb --version
arm-none-eabi-size --version
```

### Windows

Download the installer from the [official site.](https://developer.arm.com/tools-and-software/open-source-software/developer-tools/gnu-toolchain/gnu-rm/downloads)
Then run it and follow the Wizard's instructions.

To check the installation, open a CMD window (Windows key + R, type CMD) and type:

```
arm-none-eabi-gcc --version
arm-none-eabi-g++ --version
arm-none-eabi-gdb --version
arm-none-eabi-size --version
```

### Mac

The easiest way to install this and the other tools is using `Brew`; if you don't have it yet,
you can install it by running the command below:

```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Once it is installed, you only need to run the command below:

```
brew install --cask gcc-arm-embedded
```

To check the installation, open a new terminal window and type:

```
arm-none-eabi-gcc --version
arm-none-eabi-g++ --version
arm-none-eabi-gdb --version
arm-none-eabi-size --version
```

## OpenOCD 

It is the tool that handles the communication between the computer and the controller; it is used
mainly to help with debugging, but it can also be used as a flasher. It works as a GDB server,
which receives the requests made by GDB clients, and also as a telnet server.

### GNU/Linux

For the most recent versions of OpenOCD, you will need `libftdi` (even if you have an ST-Link
connector).

The easiest way to install it is using your package manager.

On Debian, for example, you need to run:
```
sudo apt install openocd
```

Check which package manager you have; it probably won't be much different from this.

To check that it was installed correctly, type:

```
openocd --version
```

The output should be something like:

```
Open On-Chip Debugger 0.11.0
Licensed under GNU GPL v2
For bug reports, read
	http://openocd.org/doc/doxygen/bugs.html
```

### Windows

The easiest way is through [chocolatey](https://chocolatey.org/install), a package manager made
specifically for Windows.
Download choco through that link, install it, and then run this command in the command
prompt:

```
choco install openocd 
```

You can also download the latest version straight from the repository through [this link](https://github.com/openocd-org/openocd/releases/).
The file is at the end of the page and its name will be something like `openocd-v0.x.x-i686-w64-mingw32.tar.gz`,
where `x.x` is the number of the latest version available.

To check that it was installed correctly, open the prompt and type:

```
openocd --version
```

The output should be something like:

```
Open On-Chip Debugger 0.11.0
Licensed under GNU GPL v2
For bug reports, read
	http://openocd.org/doc/doxygen/bugs.html
```

### Mac

On the Mac, as always, the easiest way to install it is using `Brew`, with the
command:

```
brew install open-ocd
```

To check that it was installed correctly, type:

```
openocd --version
```

The output should be something like:

```
Open On-Chip Debugger 0.11.0
Licensed under GNU GPL v2
For bug reports, read
	http://openocd.org/doc/doxygen/bugs.html
```

## GNU Make

A tool used to help run repetitive tasks; it also figures out which parts of the program need to
be recompiled and runs the related tasks automatically.

### Linux and Mac

It already comes installed by default on these systems. 

### Windows 

The easiest way is through [chocolatey](https://chocolatey.org/install), a package manager made
specifically for Windows.
Download choco through that link, install it, and then run this command in the command
prompt:

```
choco install make
```

You can also install it directly through this [link](http://gnuwin32.sourceforge.net/install.html),
but pay attention: unlike `choco`, you will have to install the dependencies and do the
configuration by hand.

## CMSIS

The best way to get the most recent version is straight from the GitHub repository, at
https://github.com/STMicroelectronics/STM32CubeF1/tags. You can download the files by clicking
the "zip" link, right next to the date of the latest release. If you want, you can also `clone`
the latest version straight from the project's `master` or `main` branch.

If you are following our course on YouTube, run the code below in the root directory of your
project:

{% highlight bash %}
git clone --depth 1 ssh@github.com:STMicroelectronics/STM32CubeF1.git stm32 && rm -rf $_/.git
{% endhighlight %}

It downloads the most recent files into a directory called `stm32`, wherever you run it.

## Conclusion

With just the tools above, you will be able to develop for any processor in the Cortex-M, A and R
lines, on every platform and operating system. And as you may have noticed, they have evolved a
lot, and installing them gets easier every time. Now you just need to download them and start
programming.
