Did you ever remember when you realized that `[` is a built-in command in bash, like `echo`, `cd`?
Well we as humans have a tendency to assume things and so I did for a long time. As I came from a Windows background and high level languages, in the beginning I just learnt the necessary to be able to do my job as a frontend engineer.

So I learnt how to create branch decisions using `if`, which in fact is a shell keyword, I assosiate it with what I had learn in the past, associating `if [ commands ];` as syntax constraint as the others languages and never worried about what I was doing, after all I had my work done at the end of the day.

Well, as the time went by, I realized that I had to learn more about this language, well you know, it is impossible to work with linux *effectively* without knowing it. 

So I decided to start from scratch assuming I know nothing about it, it was a great decision as with my mind open I started watching and reading basic tutorials, it is sad how there are bad content on the internet, you have to take much care when you decide to learn new things as the chances you got misleading content(or just wrong) is high.

Well, I was in luck when I found the [Bash Guide](http://mywiki.wooledge.org/BashGuide), written by LHunath and GreyCat. They do a great job explaining what you really need to know in a easy way. 

They were the first content where they take a step trying to let it clear for the readers that it is a command and it needs the parameter `]` as the last one.

See what they say:

> `if` executes the command `[` (remember, you don't need an `if` to run the `[` command!) with the arguments `a, =, b `and `]`. `[` uses these arguments to determine what must be checked. In this case, it checks whether the string a (the first argument) is equal (the second argument) to the string b (the third argument), and if this is the case, it will exit successfully. However, since the string "a" is not equal to the string "b", `[` will not exit successfully (its exit code will be 1). if sees that `[` terminated unsuccessfully and executes the code in the else block.
> The last argument, "**]**", means nothing to `[`, but it is required. See what happens when you omit it.

> (credits http://mywiki.wooledge.org/BashGuide/TestsAndConditionals)

In that moment everything that I thought it was weird with bash started making sense. before that I never realised why I can't write things like `if[$1 -lt 10]` (note I didn't use spaces) or execute commands inside the brakets like `if [ "$1" -eq $(cat file) ]`.

The simpler fact that I know that `[` is a command, like any normal bash program and it *expects* parameters to be passed, made me never make this kind of mistake again. 

I was so suprise by this little thing that I said to me if even I write anything to my blog I again should be about it. Well, years later here am I :)

And you when you ever realized that `[` is a command?