# then-pipeline
Build cancellable pipelines to transform your data.

The primary purpose for building pipelines with `then-pipeline` is to chain a sequence of functions that transform your data, while transparently handling asynchronous tasks.

> The output of one transform is the input for the next.

And what exactly is a transform? It is just a function that is *expected* to change the input and return new data. If a transform does not change the input, it is also fine, but at least the expection is that it could if it needed to.

A transform takes the data to be transformed as the first argument, and a `cancel` function as the second argument. This `cancel` function can be used to stop the execution of the pipeline. This means that every transform is equipped with the ability to stop the execution of the remaining transforms. In the event that a transform cancels the pipeline, whatever value is returned by that transform is the final result of the pipeline. Transforms can also return promises which allows for the composition of asynchronous workflows.

## But why though?

This is similar to lots of the *Middleware* utilities out there. Except that this runs *all* your transforms by default, until you `cancel` the sequence. As oppossed to calling `next` in every transform in order to execute the next transform in the pipeline. The reason for this reversed non novel approach is that I have found that more often than not you want to execute *all* transforms in the pipeline. So I figured I'd reduce the boilerplate for the common case. And in order to control async workflows, transforms can choose to return Promises.

Another really important feature of `then-pipeline` is to enable immutable data processing. Transforms return data that is subsequently passed into the next transform, instead of mutating objects and relying on side effects in order to communicate changes to subsequent transforms.

``` javascript
/* tranditional transform: no more side effects to communicate changes to other transforms - YES - 100%! */
function sideEffectObjectTransform(req, res, next) {
  req.your_changes = 'this is mutating an object causing side effects';
  next();
}

/* instead, your transform returns the data subsequent transforms will receive. You can use tools like Immutable.js or Icepick.js to manage your immutable structures. I have just chosen a common naive merging strategy for illustration purposes */
function noSideEffectObjectTransform(data, cancel) {
  return extend({}, data, {
    req: {
      my_changes: 'this does NOT cause side effects'
    }
  });
}
```


## Install

```
$ npm install then-pipeline --save
```

## API

### Pipeline(transforms)

Constructor to create a pipeline with transforms to process data.

- **@param** {array[function]?} *transforms* - Array of callback functions that transform your data.


### Pipeline.runAsync(data, transforms)

> Static method on Pipeline

Method to execute a list of transforms *asynchronously* to process your data. Transforms can optionally and safely return promises in order to control the pipeline execution.

- **param** {*} data - Data to be passed into the pipeline for processing. Can be anything your transforms expect.
- **param** {array[function]} transforms - Functions that transform your data.
- **returns** {Promise} That when resolved, it returns the transformed value from the pipeline.


### Pipeline.runSync(data, transforms)

> Static method on Pipeline

Method to execute a list of transforms *synchronously* to process your data.

- **param** {*} data - Data to be passed into the pipeline for processing. Can be anything your transforms expect.
- **param** {array[function]} transforms - Functions that transform your data.
- **returns** {*} Transformed value from the pipeline.


### use(transform(data, cancel))

Method to register transforms.

- **@param** {function} *transform* - Tranform to be added to the pipeline.
- **@returns** {Pipeline} Current Pipeline instance.


### runAsync(data)

Method to execute the registered transforms *asynchronously*. Transforms can optionally and safely return promises in order to control the pipeline execution.

- **param** {*} data - Data to be passed into the pipeline for processing. Can be anything.
- **returns** {Promise} That when resolved, it returns the transformed value from the pipeline.


### runSync(data)

Method to execute the registered transforms *synchronously*.

- **param** {*} data - Data to be passed into the pipeline for processing. Can be anything.
- **returns** {*} Transformed value from the pipeline.


## Example

Below is a pretty contrived example to illustrate the creation of a pipeline with three transforms, one of which returns a promise to illustrate how asynchronous tasks seemlessly integrate into your pipeline.

> NOTE: You generally want to use `runAsync`, unless you know that all the transforms are synchronous and you really need synchronous behavior.

``` javascript
var Pipeline = require('then-pipeline');
var pipeline = Pipeline();

pipeline
  .use(addHeader)
  .use(addBody)
  .use(addFooter);

pipeline
  .runAsync('Initial data')
  .then(function(result) {
    console.log(result);
  });

pipeline
  .runAsync('Some other data')
  .then(function(result) {
    console.log(result);
  });

function addHeader(data, cancel) {
  return 'this is the header.' + data;
}

function addBody(data, cancel) {
  return fetch('url-to-content')
    .then(function(response) {
      return response.text();
    });
}

function addFooter(data, cancel) {
  return data + ' - this is the footer';
}
```

This is a variation of the example above if you like to keep your Pipelines stateless and think `this` is an evil construct. :D

``` javascript
var Pipeline = require('then-pipeline');
var transforms = [addHeader, addBody, addFooter];

Pipeline
  .runAsync('Initial data', transforms)
  .then(function(result) {
    console.log(result);
  });

Pipeline
  .runAsync('Some other data', transforms)
  .then(function(result) {
    console.log(result);
  });

function addHeader(data, cancel) {
  return 'this is the header.' + data;
}

function addBody(data, cancel) {
  return fetch('url-to-content')
    .then(function(response) {
      return response.text();
    });
}

function addFooter(data, cancel) {
  return data + ' - this is the footer';
}
```


# License MIT
