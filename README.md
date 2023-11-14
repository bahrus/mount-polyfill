# mount-polyfill

Author:  Bruce B. Anderson
Issues / pr's:  [mount-polyfill](https://github.com/bahrus/mount-polyfill)

What follows is a more ambitious alternative to [this proposal](https://github.com/w3c/webcomponents/issues/782).  The goals of this proposal are larger, and less focused on registering custom elements.  In fact, this proposal is trying to address a large number of use cases in one api.  It is basically mapping common filtering conditions in the DOM, to common actions, like importing a resource, or at least invoking some action.

The extra flexibility this new primitive would provide could be quite useful to things other than custom elements, such as implementing [custom enhancements](https://github.com/WICG/webcomponents/issues/1000) as well as [binding from a distance](https://github.com/WICG/webcomponents/issues/1035) in userland.

To specify the equivalent of what the alternative proposal linked to above would do, we can do the following:

```JavaScript
const observe = mount({
   match: 'my-element',
   within: myRootNode,
   import: './my-element.js',
   doCallbackIf: (import, matchingElement) => customElements.get(matchingElement.localName) === undefined,
   callback: (import, matchingElement) => customElements.define(matchingElement.localName, import.MyElement)
})
```

If no import is specified, it would go straight to doCallbackIf.  If no doCallbackIf is specified, it would go straight to callback.

Why not just keep the api to a minimum, and just define a callback?  Or why even have a callback?  As we will see below, the returned object provides the ability to subscribe to matching elements, so why not just provide the observing part of the equation?

The answer is I believe it would be useful for bundling engines to be able to expose and categorize in as declarative a manner as possible these common behaviors.

This proposal would also include support for CSS, JSON, HTML module imports.

"match" is a css query, and could include multiple matches using the comma separator, i.e. no limitation on CSS expressions.

The "observer" constant above would be an EventTarget, which can be subscribed to.

The callback option is optional.  doCallbackIf is also optional, and only applicable if the callback option is specified.

As matches are found (for example, right away if matching elements are immediately found), the imports object would maintain a read-only array of weak references, , along with the imported module:

```TypeScript
interface ImportTargets {
    weakReferences:  readonly WeakRef<Element>[];
    module: any;
}
```

This allows code that comes into being after the matching elements were found, to "get caught up" on all the matches.  

##  Extra lazy loading

By default, the matches would be reported as soon as an element matching the criterion is found or added into the DOM, inside the node specified by rootNode.

However, we could make the loading even more lazy by specifying intersection options:

```JavaScript
const observer = mount({
   match: 'my-element',
   within: myRootNode,
   intersectionObserverOptions: {
      rootMargin: "0px",
      threshold: 1.0,
   },
   import: './my-element.js'
})
```

## Media / container queries

Unlike traditional CSS @import, CSS Modules don't support specifying different imports based on media queries.  That can be another condition we can attach (and why not throw in container queries, based on the rootNode?):

```JavaScript
const observer = mount({
   match: 'my-element',
   within: myRootNode,
   mediaMatches: '(max-width: 1250px)',
   containerQuery: '(min-width: 700px)',
   import: ['./my-element-small.css', {type: 'css'}]
})
```

## Subscribing

Subscribing can be done via:

```JavaScript
observer.addEventListener('import', e => {
  console.log({matchingElement: e.matchingElement, module: e.module});
});
```

## Preemptive downloading

There are two significant steps to imports, each of which imposes a cost:  

1.  Downloading the resource.
2.  Loading the resource into memory.

What if we want to download the resource ahead of time, but only load into memory when needed?

The link rel=modulepreload option provides an already existing platform support for this, but the browser complains when no use of the resource is used within a short time span of page load.  That doesn't really fit the bill for lazy loading custom elements and other resources.

So for this we add option:

```JavaScript
const observer = conditionalImport({
   mount: 'my-element',
   loading: 'eager',
   import: './my-element.js',
   callback: (import, match) => customElements.define(import.MyElement)
})
```

The value of "loading" is 'lazy' by default.