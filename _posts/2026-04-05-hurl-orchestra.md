---
layout: post
title: "hurl-orchestra: AI first API automation testing"
excerpt: Write each API test step as a small Hurl file, say which steps must pass first, and hurl-orchestra runs them in the right order and shows you which step broke.
modified: 2026-04-05
tags: [hurl, api, testing, python, ai]
comments: true
permalink: /hurl-orchestra-ai-first-api-testing/
---
{% include toc.html %}

![A cauliflower conductor beats time while a dependency graph lights up one wave at a time](https://www.estacouveflor.com/hurl-orchestra/logo-animated.svg)

If you test an API, you probably know this flow: log in, create a cart, add an item, check out. Each
step needs something from the step before it, like a token or an id. **hurl-orchestra** is a small
tool that lets you write each of those steps as a small text file and then runs them in the right
order for you. When a step breaks, it tells you which one, and it keeps running everything that
does not depend on it.

Its first release on PyPI was 0.4.1. The examples below use the current version, 0.11.0, so you can
copy them and run them as they are.

## Why I built it

[Hurl](https://hurl.dev) is a great tool. You write an HTTP request and its assertions in plain
text, and it runs them. The trouble starts when a suite outgrows one file. You split the tests, and
then you need something to call Hurl in the right order and to carry values like a login token from
one file to the next. Usually that "something" ends up being a shell script, and that script only
gets bigger.

I wanted to declare the order instead of scripting it. So each file now says what it needs, and
the tool works out the rest.

## How it looks

A Hurl file gets a small header between two `---` lines (this header is called *frontmatter*, and
it is plain YAML). Here is a login step:

{% highlight text %}{% raw %}
---
id: auth
outputs: [token]
---
POST {{base_url}}/login
{
  "user": "ada",
  "password": "{{password}}"
}
HTTP 200
[Captures]
token: jsonpath "$.token"
{% endraw %}{% endhighlight %}

A *capture* is a value Hurl pulls out of a response, here the `token` from the JSON body. The
`outputs` list says which captures this step shares with others. Now a step that needs it:

{% highlight text %}{% raw %}
---
id: profile
deps: [auth]
---
GET {{base_url}}/profile
Authorization: Bearer {{auth_token}}
HTTP 200
[Asserts]
jsonpath "$.user" == "ada"
{% endraw %}{% endhighlight %}

`deps: [auth]` means "run `auth` first". The token arrives as `auth_token`: the name of the
producer, an underscore, then the output name. I did it this way so that two steps can both capture
a `token` without stepping on each other.

Running it is two commands:

{% highlight bash %}
pip install hurl-orchestra
hurl-orchestra ./tests
{% endhighlight %}

{% highlight text %}
Variables file: tests/.env
SUCCESS: auth [captured: token]
SUCCESS: profile [injected: auth_token]
Report saved to tests/report.zip
{% endhighlight %}

A `.env` file holds global values like `base_url`, and every Hurl call gets it. It can sit next
to the tests, or anywhere else with `--env-file`, for example at the root of your project. The run ends with exit code 0 when everything passes and 1 when something fails, so it
fits any CI.

## The graph, in plain words

Behind the scenes, the files form a *DAG*, a directed acyclic graph. That is a fancy name for a
set of steps connected by arrows ("this needs that") where the arrows never loop back. From it,
hurl-orchestra builds *waves*: a wave is every step whose dependencies are already done. Steps in
the same wave run at the same time; the next wave starts when the current one finishes.

You can see the plan without sending a single request:

{% highlight bash %}
hurl-orchestra --dry-run tests/checkout.hurl
{% endhighlight %}

{% highlight text %}
Resolved dependencies: add_item, auth, create_cart
Plan: 4 node(s)
  wave 1: auth
  wave 2: create_cart
  wave 3: add_item
  wave 4: checkout
{% endhighlight %}

Notice that I only asked for `checkout.hurl`, and it pulled in what checkout needs. The whole graph
is also validated before the first request: an unknown dependency, a cycle or a field with the
wrong type stops the run with a one-line error, so a broken graph never runs half a suite.

## A failure stops only its branch

This is the part I like the most. When a step fails, only the steps that depend on it are skipped.
Everything else keeps going, so one run shows you every broken flow, not only the first one.

![The interactive score: create_cart fails, add_item and checkout are skipped, catalog still passes](https://www.estacouveflor.com/hurl-orchestra/readme/score-light.webp)

In the picture, `create_cart` fails, so `add_item` and `checkout` are skipped, while `catalog`,
which does not need a cart, still passes. You can play with this on the
[docs home page](https://www.estacouveflor.com/hurl-orchestra/#the-score): pick a step, make it
fail and watch the run.

## Why "AI first"

I want to be clear here: there is no model inside hurl-orchestra, and nothing to configure. "AI
first" means the files, the commands and the results are easy for a coding agent (Claude Code,
Codex and friends) to write, check and read:

- The tests are plain-text Hurl files with a few frontmatter fields. No code to compile.
- `hurl-orchestra --dry-run --json tests` prints the plan as JSON, including the variable names
  each file can use, so an agent can check the graph before it sends any request.
- `--report-ctrf` writes the results as *CTRF*, the Common Test Report Format, a JSON file with
  one test per request and the reason for each failure.
- The whole documentation is published as a single
  [llms-full.txt](https://www.estacouveflor.com/hurl-orchestra/llms-full.txt) file that you can
  hand to an agent.

The same CTRF file also works for humans: the
[GitHub test reporter](https://github.com/ctrf-io/github-test-reporter) turns it into a test
summary in your GitHub Actions job.

## Under the hood

It is small on purpose. It needs Python 3.11 or later and has one dependency,
`python-frontmatter`. The ordering comes from the standard library's `graphlib`, and the waves run
on a thread pool. Captured values reach Hurl through a private variables file for each call, so a
token never shows up in the process list.

## Where it went next

Since the first release, the project kept growing. Some of what you saw above came later:

- `--dry-run`, and running a single file together with the steps it depends on.
- The CTRF report for CI.
- A `retry` policy with exponential backoff and jitter, for APIs that push back with a `429` or a
  `503`.
- `known_failures`, to tolerate a failure you already understand, with a reason and an expiry
  date. The report still shows it, and `--strict` turns it back into a failure.
- The JSON plan for agents I mentioned above.
- A proper [documentation site](https://www.estacouveflor.com/hurl-orchestra/), with a getting
  started guide, concepts and how-tos.

## Try it

If you have a Hurl suite that is getting too big for one file, or a pile of shell scripts calling
Hurl in order, give it a try:

- Docs: [estacouveflor.com/hurl-orchestra](https://www.estacouveflor.com/hurl-orchestra/)
- PyPI: [pypi.org/project/hurl-orchestra](https://pypi.org/project/hurl-orchestra/)
- GitHub: [klaygomes/hurl-orchestra](https://github.com/klaygomes/hurl-orchestra)

And if you have a flow it cannot express yet, open an issue or leave a comment below. I would like
to hear about it :)
