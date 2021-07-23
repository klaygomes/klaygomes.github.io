For the last years I got used to work with my computer setting everything by hand. Yes, I know it is very inefficient. But, I barelly have to format my computer. I can count in one hands how much time I formated my computer for the last 4 years.

In Brazil I was used to use my home computer to do my job, as I was working remotely for the last couple of years. So, everything that I need was there. It lasted until I had to move, and now as I'm working in a Bank, the things had changed. I saw my self being obligated to use the company computer and this computer being really restrict. To make things worse I had to format more than one time since I started working (First time was my fault as I really messed with the configuration, the second time was because an Apple update and compatibility issue that let my computer unusable).

Well, this thing teach me that I needed a dotfile repository where I must manage my configuration files. Well, the first thing I did was look which options we had as working solutions. The most know one was GNU Stow. Well, I may say it really shines when you have a very complex configuration tree, with a lot of files. For my case, where I had just a little few configurations, it didn't apper to make sense, I wanted something that I can use with a new instalation of a Mac OS and with only one command, install everything I need and all the boring stuff, and for using stow I had to at least install it as it does not come in Mac by default.

## The GNU Make for rescue

For the last years I was procrastinating about to study Make, so I thought it could be a good ideia to learn make and does something relevant with it. And it was the perfect choice, before I start messing with my configuration files, I downloaded the GNU Make documentation (a 230 pages PDF) and I started reading it. I may say I got very suprised how it is straiforward, sometimes, of course, the documentation gets really dense (try to read the explanation for autovars for example), but if you read with care you will start getting the point how it was projected.

At the end I may say I'm very happy with the result, and I would like to show what I have learned in this proccess.


## The Makefile

Bellow is my actual make file, I will try to explain line by line what I'm doing and how you may change it to fit your needs.



<Make file goes here>
