---
layout: post
title: Using GNU Make as your Dotfiles manager 
excerpt: It tells you how you can manage your dotfiles without any external dependencies.
tags: [make, dotfiles, linux, blog]
modified: 20-06-2021
comments: true
---
{% include _toc.html %}

For the last years, I got used to set everything on my computer by hand. Yes, I know it is very 
inefficient. But, I barely have to format my laptop. I can count on one hand how many times I have
formatted my computer in the last 4 years.

## The motivation

In Brazil, as I was working remotely for the last couple of years, I got used to using my computer
to do my job and personal stuff. So, everything that I needed was there. It lasted until I had to 
move, and now as I'm working in a Bank, things have changed. I saw myself being obligated to use 
the company computer and this computer is really restricted. To make things worse, I had to format 
more than one time since I started working (The first time was my fault as I messed with the 
configuration. The second time, an Apple update and compatibility issue made my computer unusable).

This situation taught me that I needed a dotfile repository where I must manage my configuration
files.  Well, the first thing I did was look at which options we had as working solutions. The most
know one was GNU Stow. Well, I may say it really shines when you have a very complex configuration
tree with many files. It didn't appear to make sense for my case, where I had just a few
configurations.

I wanted something that I could use with a new installation of a Mac OS and with only one command,
install everything I need and all the boring stuff, and for using stow, I had to at least install 
it as it does not come in Mac by default.

## The GNU Make for rescue

I was procrastinating on studying `Make` for the last years, so I thought it could be good to learn 
Make and do something relevant. And it was a perfect choice; before I started messing with my 
configuration files, I downloaded the GNU Make documentation (a 230 pages PDF), and I started 
reading it. I may say I got amazed at how it is straightforward, sometimes, of course, the 
documentation gets really dense (try to read the explanation for autovars, for example), but if you
read with care, you will start getting the point of how it was projected.

In the end, I may say I'm thrilled with the result, and I would like to show what I have learned in
this process.

## The Makefile

Bellow is my actual make file; Basically, it manages the creation and copy of configuration files
to the `~/.config` folder as they are changed on the repository folder, keep them in sync. I will 
try to explain line by line what I'm doing and how you may change it to fit your needs.

`{% highlight make linenos %}
CONFIG		:=	$(HOME)/.config/

VIM 		:=	$(addprefix ${CONFIG}, $(wildcard nvim/* nvim/**/*))
ZSH		:=	$(addprefix ${CONFIG}, $(wildcard zsh/*))
ZSH_CONFIG	:=	${HOME}/.zshrc
GIT		:=	${HOME}/.gitconfig
BREW		:=	$(HOME)/Brewfile
BREW_ENV	:=	$(HOME)/.brewenv
MAC		:=	$(CONFIG)mac/install.sh
NODE		:=	$(CONFIG)node/globals

CREATE_TARGET_DIR=	if [ ! -d "$(@D)" ]; then echo "Directory $(@D) was not found, creating..." && mkdir -p "$(@D)";fi;

.PHONY: all mac brew git vim

all:| mac brew zsh git node vim;

.SECONDEXPANSION:
$(VIM): $$(subst ${CONFIG},, $$@)
	@$(call CREATE_TARGET_DIR)
	@if [ ! -d $< ]; then 					 \
		echo "Including ${^} configuration to ${@}" 	;\
 		cp $< $@					;\
	fi							 

.SECONDEXPANSION:
$(ZSH): $$(subst ${CONFIG},, $$@)
	@$(call CREATE_TARGET_DIR)
	@echo "Including ${^} configuration to ${@}"
	@cp "${^}" "${@}"
	@if [ "${@F}" = "setup.sh" ] ; then 	 \
		${@} "${HOME}" "${CONFIG}" 	;\
	else 					 \
		file="source '${CONFIG}${^}';" &&\
		(                                \
			grep "$${file}" ${ZSH_CONFIG} -q || echo "$${file}" >> ${ZSH_CONFIG} \
		) ;                              \
	fi

$(MAC): mac/install.sh
	@$(call CREATE_TARGET_DIR)
	@cp ${^} ${@}
	@${@}

$(GIT): $(wildcard git/*) 
	@./git/install.sh ./git/.gitconfig

$(BREW): $(wildcard brew/*)
	@./brew/install.sh
	@cp ./brew/Brewfile ${HOME}/Brewfile
	@source ${BREW_ENV} 								&&\
	($${HOMEBREW_PREFIX}/bin/brew bundle --file ${HOME}/Brewfile --force || exit 0) &&\
	./brew/setup.sh

$(NODE): node/globals
	@xargs -I {} -n 4 npm install {} --global < "${^}"
	@mkdir -p "${@}"
	@cp "${^}" "${@}"

vim:  $(VIM)
git:  $(GIT)
brew: $(BREW)
mac:  $(MAC)
node: $(NODE)
zsh:  $(ZSH)

node/globals: ;
mac/install: ;
{% endhighlight %}

Lines 1 to 10 are variables that hold the list of files. 

- The syntax `$(something)` is used as the same as `${something}`, which means you want to
interpolate the current value of `something`, into its current value.

But `$(something ${other}...)`, or `$(something $(other)...)` tells make you are calling the 
function `something` passing the value of the variable `other` as its first argument (you may give 
more than one just separating them with spaces).

The attribution symbol `:=` tells make I want these values to be assessed only one time while the 
file is being parsed; otherwise, if you use simply `=`, it means this value will be evaluated every
time you reference it.

Note how it is desirable as I use these variables all over the place. I'm calling the special 
functions `addprefix` and `wildcard` and doing expression expansions (getting everything 
recursively inside the directories using ** ).

- `addprefix` as its name suggests, it adds a prefix for each item of a list.
- `wildcard` returns a list of files fetched by the expressions expansions. This function accepts 
more than one argument.

In short, I'm getting all files from these directories and adding `${CONFIG}`, which in turns 
points to ${HOME}/.config/ (usually ~/.config).

However, the variable `CREATE_TARGET_DIR`, on line 12, is used as a `function` I use `=` as it must
be evaluated every time it is called.

On line 14, I used a `directive` called `.PHONY`, which informs `make` which `recipes` its output 
should not be considered a valid file, or better, which ones do not produce an output file. On our 
Makefile, they are defined on lines 60-69 and are used only to tell make I want to run them when 
any file they depend on was changed. Note they use the variable with the list of files I got on 
lines 1-10.

On line 16, I created a `recipe` called `all`, which calls `in sequence` the recipes `mac`, `brew`,
`zsh`, `git`, `node`, `vim`. Note I used `:|` to force `make` to execute in sequence.

The first recipe inside `Makefile` is called by default whenever make is called without arguments;
in our file, it is the recipe `all`.

On lines 18-55 are the `recipes` for all the Makefile. Before I start explaining them I should give
a little introduction to how they are formed. 

A Makefile consists of a set of `recipes`. A recipe generally looks like this:
```
targets: prerequisites
   command
   command
   command
```

- The targets are file names separated by spaces. Typically, there is only one per rule.
- The commands are a series of steps typically used to make the target(s). These need to start with
a tab character, not spaces.
- The prerequisites are file names separated by spaces. These files need to exist before the 
commands for the target are run. These are also called dependencies.  Each recipe can be called 
independently and represent a single file on the system. (fit not tagged as .PHONY)

Now let's analyze the first recipe we have at lines 26-58.

- `.SECONDEXPANSION` is a directive that tells Make to expand the variables contained into the 
following recipe more than once.  You may ask why?

On line 19; first, I declare the target from the variable `$(VIM)`, which we know is a list of 
files contained inside the ${CONFIG}/vim folder; these values are used as `input` parameters to the 
`dependencies` PLUS (it is essential) the CURRENT target which trigged the rule.

> Translation: It creates a unique `recipe` for each `target` using only one dependency, that is, 
the target itself without the ${CONFIG} prefix.

On line 20, I call the `function` CREATE_TARGET_DIR, responsible for creating the target directory 
if it does not exist. 

> Note the variable `$(@D)`; it is an especial auto variable that expands to the directory of the 
current target.

> Note: You can declare variables as $(a), ${b} or $c inside Makefiles.

Now the variables:
- `$^` expands to the first dependency of the current target (our case, it is the same file without
the ${CONFIG});
- `$@` extends to the target which fired the recipe;
- `${@F}` same as before, but only its filename;

I must mention that:

-  I use `@` before each recipe command; it tells Make to not print to the stdout the bash command 
before executing it. 
- Inside bash scripts, if you want to use bash variables, you must include an extra `$`, so it 
will be escaped and not interpreted as a Make variable itself.

See, it is possible to use the result of functions/variables inside targets and dependencies as 
actual values, so I use it a lot throughout the entire file.

## Conclusion

It was an easy task, and I'm thrilled with the results as I had to learn a lot to make it possible.
In the end, it was a clean solution that it will last a good time inside my workflow.

You may also be interested in the final result [here](https://github.com/klaygomes/dotfiles) 
