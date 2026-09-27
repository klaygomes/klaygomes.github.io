---
layout: post
title: "MiniReact: a tiny React-like library to see what happens under the hood"
excerpt: A tiny React-like library I wrote as a take-home exercise, with class components, a virtual DOM, a synchronous setState and a simple diff-and-patch step.
modified: 2018-08-23
tags: [javascript, react, virtual-dom, frontend]
comments: true
---
{% include toc.html %}

If you use React every day, you probably call `setState` without thinking about what happens next. I had to think about it, because I wrote a small version of it as a take-home exercise for a job interview. It is called **MiniReact**, and in this post I will show you what it does, how it is organized and where it is intentionally simpler than React.

I published it to npm in August 2018, and you can find the whole code [on GitHub](https://github.com/klaygomes/mini-react).

## What you get

MiniReact is not a complete React implementation, and it does not try to be. I wrote it with four ideas in mind: immutability, separation of concerns, unit tests and error handling. The README states the goal clearly: let you create trees of plain HTML elements and components, and add or remove attributes and event listeners on the fly.

In practice, it gives you:

- `Component`, a base class for class components with `props`, `state` and `setState`;
- `node`, a factory that builds virtual DOM nodes from plain objects;
- `MiniReact.render`, which mounts everything inside a real DOM element.

When you build it, webpack outputs `public/mini-react.js` with `libraryTarget: 'window'`, so these three names become globals in the browser. No JSX and no build step on your side.

## Two words before we start

A **virtual DOM** is just a tree of plain JavaScript objects that describes what the page should look like. Creating objects is cheap; touching the real DOM is not.

**Reconciliation** (or diffing and patching) is the process of comparing the old tree with the new one and changing only what is different in the real DOM.

MiniReact does both, in a very small way.

## Writing a component

Here is the demo app that ships with the repo (`public/App.js`), trimmed a bit. It is a small limit adjuster: a text input and a range slider that stay in sync.

{% highlight javascript %}
class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      definedLimit: 2500,
      maxLimit: 5000,
    };
  }

  setDefinedLimit(e) {
    this.setState(() => ({
      definedLimit: parseInt(e.target.value)
    }))
  }

  render() {
    return node({
      tagName: 'div',
      children: [
        { tagName: 'h1', textContent: 'Ajuste de limite' },
        {
          tagName: 'input',
          type: 'range',
          min: 0,
          max: this.state.maxLimit,
          value: this.state.definedLimit,
          onchange: e => this.setDefinedLimit(e)
        }
      ],
    });
  }
}
{% endhighlight %}

And mounting it is one line in `public/index.html`:

{% highlight javascript %}
MiniReact.render(new App(), root);
{% endhighlight %}

Notice the "blueprint" objects: `tagName` is the HTML tag, `children` is a list of more blueprints (or plain strings), and every other key becomes an attribute. A key starting with `on` becomes an event listener.

## Two differences from React

**`setState` only accepts a function.** You pass a function that receives the previous state and props and returns an object. That object is deep-merged into the current state:

{% highlight javascript %}
setState (func) {
  !isFunction(func) && throwError('state must be a function!')
  const previousState = shallowClone(this.state)
  const props = shallowClone(this.props)
  this.state = mergeObjects(this.state, func(previousState, props))
  this.__child = this.__patch(this.__child, this.render(props, this.state))
}
{% endhighlight %}

**It is synchronous.** As you can see in the last line, the component re-renders and patches the DOM right there, inside the `setState` call. React batches updates; MiniReact does not.

## How it works: three phases

The code is split into `src/vdom` (the virtual DOM) and `src/dom` (everything that touches the real DOM). I followed a naming convention: modules whose name ends in `-ing` (`constructing`, `patching`, `unmounting`, `rendering`) have side effects. Everything else is meant to be pure.

### Constructing

For each virtual node, MiniReact checks whether it is an element or a component. An element becomes a real DOM element with `document.createElement`, and its children are constructed recursively. A component gets instantiated, its `render` is called, and the result goes through the same process again. This is also where the component receives its `__patch` function, so `setState` can update it later.

### Patching

This is the reconciliation part, and it is intentionally simple. Given the previous and next virtual node:

- if the tag changed (a `div` became a `span`), the old node is thrown away and a new one is built;
- otherwise, attributes are diffed. Removed attributes come out as `undefined`, which removes them from the DOM:

{% highlight javascript %}
export const diff = (previousVNode, nextVNode) => Object.keys(previousVNode.attributes).reduce(
  (acc, attr) => ({[attr]: undefined, ...acc}),
  nextVNode.attributes
)
{% endhighlight %}

- if the number of children is the same, each child is patched by position;
- if it is different, the children are rebuilt from scratch.

There are no `key`s like in React, so reordering a list means rebuilding it. For a learning project, I think it is a fair trade.

### Unmounting

The cleanup phase: walk the old tree, remove DOM nodes from their parents and drop the references so the garbage collector can do its job.

## Events without leaking listeners

One detail I like: MiniReact does not attach your handler directly. Each element gets a single proxy function, `onEvent`, per event type, and the real handler is stored on the element itself:

{% highlight javascript %}
function onEvent (ev) {
  this[NODE_ATTR_PROPERTY][ev.type](ev)
}
{% endhighlight %}

When you re-render with a new arrow function, only the stored handler changes; the listener stays the same. When the handler becomes falsy, the listener is removed. There is a test for exactly that ("should remove event listener").

## Tests

Unit tests were one of the goals from the start. There are 47 Jest test cases across four files, covering the utilities, the virtual node factory, the `Component` class and the DOM rendering and patching (using jsdom). The patching tests are the fun ones: they click an element and check that a `div` flips to a `span`, or that a child component is swapped for another.

## Running it

{% highlight bash %}
git clone https://github.com/klaygomes/mini-react
cd mini-react
npm install
npm run dev   # opens http://localhost:3000
npm test
{% endhighlight %}

The README asks for Node >= 8.11.3 and npm ~5.6.0.

## Conclusion

What started as an interview exercise made React's behaviour feel less like magic: a tree of objects, a function that compares two trees, and a few careful DOM calls. If you are curious about how these libraries work, reading a small one is a good first step, and this one fits in a few files.

The code is [on GitHub](https://github.com/klaygomes/mini-react). Feel free to open it, break it, and tell me what you would do differently.
