.PHONY: start build
start:
	arch -x86_64 bundle exec jekyll serve --draft --livereload 
build:
	arch -x86_64 yarn grunt
