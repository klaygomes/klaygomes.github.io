For the last years, I got used to working with my computer setting everything by hand. Yes, I know 
it is very inefficient. But, I barely have to format my laptop. I can count on one hands how much 
time I have formatted my computer for the last 4 years.

In Brazil, as I was working remotely for the last couple of years, I got used to using my computer 
to do my job and personal stuff. So, everything that I need was there. It lasted until I had to
move, and now as I'm working in a Bank, things had changed. I saw myself being obligated to use the
company computer and this computer is really restricted. To make things worse, I had to format more
than one time since I started working (The first time was my fault as I messed with the 
configuration. The secon time, an Apple update and compatibility issue made my computer unusable).

This situation taught me that I needed a dotfile repository where I must manage my configuration
files.  Well, the first thing I did was look at which options we had as working solutions. The most
know one was GNU Stow. Well, I may say it really shines when you have a very complex configuration
tree with many files. It didn't appear to make sense for my case, where I had just a few
configurations.

I wanted something that I can use with a new installation of a Mac OS and with only one command,
install everything I need and all the boring stuff, and for using stow, I had to at least install
it as it does not come in Mac by default.

## The GNU Make for rescue

I was procrastinating on studying `Make` for the last years, so I thought it could be a good idea
to learn to make and do something relevant. And it was a perfect choice; before I start messing
with my configuration files, I downloaded the GNU Make documentation (a 230 pages PDF), and I
started reading it. I may say I got amazed at how it is straightforward, sometimes, of course, the
documentation gets really dense (try to read the explanation for autovars, for example), but if you
read with care, you will start getting the point of how it was projected.

In the end, I may say I'm thrilled with the result, and I would like to show what I have learned in
this process.

## The Makefile

Bellow is my actual make file; I will try to explain line by line what I'm doing and how you may
change it to fit your needs.

<Make file goes here>
