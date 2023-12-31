# DOM orchestration: The mount api

Author:  Bruce B. Anderson

Issues / pr's:  [mount-polyfill](https://github.com/bahrus/mount-polyfill)

Last Update: 2023-11-16

## Benefits of this API

What follows is a more ambitious alternative to [this proposal](https://github.com/w3c/webcomponents/issues/782).  The goals of the mountObserver api are larger, and less focused on registering custom elements.  In fact, this proposal is trying to address a large number of use cases in one api.  It is basically mapping common filtering conditions in the DOM, to common actions, like importing a resource, or sharing some common element settings, resulting in lower bandwidth.  The underlying theme is this api is meant to make it easy for the developer to do the right thing, by encouraging lazy loading and smaller footprints. 

This api doesn't pry open some ability developers currently lack, with at least one possible exception.  It is unclear how to use mutation observers to observe changes to [custom state](https://developer.mozilla.org/en-US/docs/Web/API/CustomStateSet). 
 
Even if that capability were added to mutation observers, the mountObserver api strives to make it *easy* to achieve what is currently common but difficult to implement functionality.  The amount of code necessary to accomplish these common tasks designed to improve the user experience is significant.  Building it into the platform would potentially:

1.  Give the developer a strong signal to do the right thing, by 
    1.  Making lazy loading easy, to the benefit of users with expensive networks.
    2.  Supporting "binding from a distance" which can allow SSR to provide common, shared data using the "DRY" philosophy, similar to how CSS can reduce the amount of repetitive styling instructions found inline within the HTML Markup.
2.  Allow numerous components / libraries to leverage this common functionality, which could potentially significantly reduce bandwidth.
3.  Potentially by allowing the platform to do more work in the low-level (c/c++/rust?) code, without as much context switching into the JavaScript memory space, which may reduce cpu cycles as well.  


The extra flexibility this new primitive would provide could be quite useful to things other than custom elements, such as implementing [custom enhancements](https://github.com/WICG/webcomponents/issues/1000) as well as [binding from a distance](https://github.com/WICG/webcomponents/issues/1035#issuecomment-1806393525) in userland.

## First use case -- lazy loading custom elements

To specify the equivalent of what the alternative proposal linked to above would do, we can do the following:

```JavaScript
const observer = new MountObserver({
   match:'my-element',
   import: './my-element.js',
   do: {
      onMount: ({localName}, {module}) => if(!customElements.get(localName)) customElements.define(localName, module.MyElement);
   }
});
observer.observe(document);
```

If no import is specified, it would go straight to do.*.

Why "mount"?  It is shorter than "orchestrate" and is used quite a bit in current frameworks (whereas orchestrate isn't).

The word mount has multiple meanings, but the one that we are leveraging is "to organize and initiate (a campaign or other significant course of action)" which is precisely what we want to do with this api.

This only searches for elements matching 'my-element' outside any shadow DOM.

The import can also be a function, and sift can specify to search within a node:

```JavaScript
const observer = new MountObserver({
   match: 'my-element',
   import: async (matchingElement, {module}) => await import('./my-element.js')
});
observer.observe(myRootNode);
```

which would work better with current bundlers, I suspect.  Also, we can do interesting things like merge multiple imports into one "module".

This proposal would also include support for CSS, JSON, HTML module imports.  

"match" is a css query, and could include multiple matches using the comma separator, i.e. no limitation on CSS expressions.

The "observer" constant above is a class instance that inherits from EventTarget, which means it can be subscribed to by outside interests.

<!-- As matches are found (for example, right away if matching elements are immediately found), the imports object would maintain a read-only array of weak references, along with the imported module:

```TypeScript
interface MountContext {
    weakReferences:  readonly WeakRef<Element>[];
    module: any;
}
```

This allows code that comes into being after the matching elements were found, to "get caught up" on all the matches. -->


##  Extra lazy loading

By default, the matches would be reported as soon as an element matching the criterion is found or added into the DOM, inside the node specified by rootNode.

However, we could make the loading even more lazy by specifying intersection options:

```JavaScript
const observer = new MountObserver({
   match: 'my-element',
   whereElementIntersectsWith:{
      rootMargin: "0px",
      threshold: 1.0,
   },
   import: './my-element.js'
});
```

## Media / container queries

Unlike traditional CSS @import, CSS Modules don't support specifying different imports based on media queries.  That can be another condition we can attach (and why not throw in container queries, based on the rootNode?):

```JavaScript
const observer = new MountObserver({
   match: 'my-element',
   whereMediaMatches: '(max-width: 1250px)',
   whereSizeOfContainerMatches: '(min-width: 700px)'
   import: ['./my-element-small.css', {type: 'css'}]
})
```

## Subscribing

Subscribing can be done via:

```JavaScript
observer.addEventListener('connect', e => {

})
observer.addEventListener('disconnect', e => {
  console.log({
      matchingElement: e.matchingElement, 
      module: e.module
   });
});

observer.addEventListener('mount', e => {
  console.log({
      matchingElement: e.matchingElement, 
      module: e.module
   });
});

observer.addEventListener('dismount', e => {
  console.log({
      matchingElement: e.matchingElement, 
      module: e.module
   });
});
```

If an element is moved from one parent DOM element to another:

1)  dismount and disconnect events are both dispatched (order TBD).
2)  When the element is added, if it is added within the rootNode being observed, it will dispatch event "connect".

"mount" occurs the first time (and subsequent times) an element meets all the criteria ("sift.for", "whereSizeOfContainerMatches", etc), "dismount" occurs after an element that previously mounted, no longer matches all the criteria.

## Preemptive downloading

There are two significant steps to imports, each of which imposes a cost:  

1.  Downloading the resource.
2.  Loading the resource into memory.

What if we want to download the resource ahead of time, but only load into memory when needed?

The link rel=modulepreload option provides an already existing platform support for this, but the browser complains when no use of the resource is used within a short time span of page load.  That doesn't really fit the bill for lazy loading custom elements and other resources.

So for this we add option:

```JavaScript
const observer = mount({
   match: 'my-element',
   within: document.body,
   loading: 'eager',
   import: './my-element.js',
   do:{
      onMount: (matchingElement, {module}) => customElements.define(module.MyElement)
   }
})
```

The value of "loading" is 'lazy' by default.

## InstanceOf checks

```JavaScript
const observer = mount({
   match: '*',
   within: document.body,
   ifInstanceOf: [HTMLMarqueeElement],
   import: './my-marquee-element-enhancement.js',
   callback: (matchingElement, {module}) => customEnhancements.define('myMarqueeElementEnhancement', module.MyMarqueeElementEnhancement)
})
```

