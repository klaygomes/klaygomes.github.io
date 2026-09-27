---
layout: post
title: "GeoLocation: a take-home challenge built with React, Redux and Sagas"
excerpt: How I turned a recruitment challenge into a small React, Redux and Next.js app that puts you and any website on a map, and the design decisions I wrote down along the way.
modified: 2017-12-22
tags: [react, redux, redux-saga, nextjs, javascript]
comments: true
---
{% include toc.html %}

If you ever had to solve a front-end take-home challenge, this post is for you. I will show how I
organized one: the stack I picked, how the data flows, and a couple of small decisions I left
written in the code so the reviewer (and now you) could understand why things are the way they are.

The source code is on [GitHub](https://github.com/klaygomes/geo-location).

## The challenge

This was not a product. I built it for a job interview, as a take-home challenge. The repository started from a template
prepared by Avenue Code Recruitment (its first commits, from 2014 to 2017, are theirs), and my own
work went from December 18 to December 22, 2017.

The story phrase in the template was simple:

> As a curious web surfer, I want to be able to locate both me and any website on a map.

In practice, the app had to:

- show my own location on a map when I click "My location", and clear it with "Reset location";
- accept a domain like `nytimes.com` or `www.g1.com.br`, call `http://freegeoip.net/json/:host`
  and show where that website is hosted;
- work on desktop, tablet and phone;
- have at least 80% of the code covered by tests, meaningful commits and a descriptive README.

That last item matters. The evaluation looked at the git history too, so I followed the
[AngularJS commit convention](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit#)
(`feat:`, `fix:`, `test:`, `chore:`...) and ended with 78 small commits instead of one big "done".

## The stack

- **React** for the components, styled with **styled-components** (CSS written inside JavaScript).
- **Redux** to keep the application state in one place.
- **Redux Saga** for side effects. A "side effect" here is anything that talks to the outside
  world, like an HTTP request.
- **Next.js** for server-side rendering (SSR), which means the first HTML is produced by the
  server instead of the browser.
- **Jest** and **Enzyme** for tests.
- **Storybook**, a small catalog where each component can be viewed and played with in isolation.

## How the data flows

Every component is "dumb": it receives data through props and reports user actions through
callbacks. A higher-order component (a function that takes a component and returns a new one)
called `WithRedux` connects them to the store:

{% highlight javascript %}
dispatch => ({
  requestHostnameLocation (hostname) {
    dispatch(actionsCreators.hostnameLocationFetch(hostname))
  },
  requestMyLocation () {
    dispatch(actionsCreators.myLocationFetch())
  },
  resetMyLocation () {
    dispatch(actionsCreators.myLocationReset())
  },
  // ...
})
{% endhighlight %}

When a `FETCH_*` action is dispatched, a saga picks it up. Both "my location" and "website
location" hit the same API, so I used one generator and a small map to decide which action to
fire on success or failure:

{% highlight javascript %}
export const fetchLocation = function * fetchLocation ({type, payload}) {
  const actions = actionMapper[type]

  try {
    const {data} = yield call(axios.get, `${API_URL}${payload || ''}`)
    yield put(actions.store(data))
  } catch (err) {
    yield put(actions.fail(err))
  }
}
{% endhighlight %}

With no payload the URL is just the API root, which returns the caller's own location. With a
hostname it returns the website's location.

The root saga uses `takeLatest`, so if you click "Locate" twice quickly only the last request
wins. Errors got a single place too: one saga watches for any action whose type starts with
`FAIL` and turns it into a message on screen.

{% highlight javascript %}
export const watchForErrors = function * watchForErrors () {
  while (1) {
    const {error} = yield take(({type}) => /^FAIL/.test(type))
    yield put(actionsCreators.errorShow(error))
  }
}
{% endhighlight %}

This way, a new request type gets error handling for free, as long as its failure action follows
the naming pattern.

## Validating the input

The form had to accept only domains, with or without `www.`. The validation is a single regular
expression in `utils/is-valid-domain.js`:

{% highlight javascript %}
const REG_URL = /^[a-zA-Z0-9\-.]+\.[a-zA-Z]{2,3}(:[a-zA-Z0-9]*)?$/

export default (url) => REG_URL.test(url)
{% endhighlight %}

If it fails, the `<HostnameDispatcher />` component selects the text and shows "Please inform a
valid hostname" instead of sending the request.

## A design decision I left in the code

My last commit was only a comment, and I think it is the most interesting one. In
`<LocationTable />`, each row has an info icon with its own click handler. The easy way would be
to write `onClick={this.onRequestInformation.bind(this, 'city')}` in `render`. The problem is that
`bind` creates a new function on every render, so a component that only re-renders when its
props change (a "pure" component) always sees a "new" prop and re-renders anyway.

So I created all the handlers once, in the constructor:

{% highlight javascript %}
// I know it should be easier/readeable to use this.onRequestInformatino.bind(this, param1, param2...)
// for each onClick, but it brings some performance implications.
// more info: https://medium.com/@esamatti/react-js-pure-render-performance-anti-pattern-fb88c101332f
this.handleOnRequestInformation = Object.keys(this.descriptionTable).reduce((acc, cur) => {
  acc[cur] = () => {
    if (typeof this.props.onRequestInformation === 'function' && this.props.lastUpdate) {
      this.props.onRequestInformation(cur, this.descriptionTable[cur], this.props.lastUpdate)
    }
  }
  return acc
}, {})
{% endhighlight %}

As the commit message says: pure render optimized components can be very fast, but they require
you to treat data as immutable, and in JavaScript that can be challenging sometimes.

## What I left out

The solution page listed what was missing, and I prefer to be upfront about it: fixing FOIT
(the flash of invisible text while web fonts load), caching API calls, more tests, webpack
optimization and i18n.

## Update, September 2026: running it today

The README points to a Heroku demo, a hosted Storybook and a coverage report. Those links no
longer work, and `freegeoip.net` itself no longer answers, so the demo is not online anymore. The
code is still there: nine components have stories you can open with `npm run storybook`, and
`npm run test:coverage` generates the coverage report locally. Keep in mind the README asks for
Node 8.

## Conclusion

It was a small app, but a good excuse to put Redux Saga, SSR and Storybook together in a few
days and to practice writing commits someone else would read.

If you are preparing for a challenge like this, feel free to browse the
[repository](https://github.com/klaygomes/geo-location) and the commit history. And if you would
have organized it differently, tell me in the comments.
