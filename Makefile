.PHONY: start build
start:
	bundle exec jekyll serve --draft
build:
	yarn grunt