# then-pipeline
Build cancellable data tranformation pipelines. Pipelines can be promise based, which provides a clean way to create cancellable promise sequences for transforming data.

The primary purpose for building pipelines with `then-pipeline` is to chain a sequence of data processors that transform and cascade data to the next handler, while smoothly handling async work and enabling immutable structure data merging.

> The output of one handler is the input for the next.

## But why though?

This is similar to lots of the *Middleware* utilities out there. Except that this runs *all* your handlers by default, until you `cancel` the sequence. As oppossed to calling `next` in every handler in order to execute the next handler in the pipeline. The reason for this reversed approach is that I have found that more often than not you want to execute *all* handlers in the pipeline. So I figured I'd reduce the boilerplate of calling next for the common case. So in order to control async work, handlers return Promises.

Another really important feature of `then-pipeline` is to enable immutable data processing. Handlers now return data that is subsequently passed into the next handler, instead of mutating objects and relying on side effects in order to communicate changes to subsequent handlers.

``` javascript
/* no more side effects to communicate changes to other handlers - YUCK! */
function mutateObjectHandler(req, res, next) {
  req.your_changes = 'this is mutating an object causing side effects';
  next();
}

/* instead, your handler returns the data subsequent handlers will receive. You can use tools like Immutable.js or Icepick.js to manage your immutable structures. I have just chosen a common naive merging strategy for illustration purposes */
function transformObjectHandler(data, cancel) {
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

### Pipeline(handlers)

Constructor to create a pipeline with handlers to process data.

- **@param** {array[function]} *handlers* - Array of callback function that make up the pipeline and process data.


### use(handler(data, cancel))

Method to register handlers that process data.

- **@param** {function} *handler* - Callback function to be added to the pipeline, which we will refer to as *handler*. The handler is called with input data as the first argument, and a `cancel` function as the second argument. The cancel function will stop further handlers from being called, where the value returned by the cancelling handler is the final value returned by the pipeline execution.
- **@returns** {Pipeline} Current Pipeline instance.


### runAsync(data)

Method to execute the registered handlers *asynchronously*. Handlers can optionally and safely return promises in order to control the pipeline execution.

- **param** {*} data - Data to be passed into the pipeline for processing. Can be anything.
- **returns** {Promise} That when resolved, it returns the transformed value from the pipeline.


### runSync(data)

Method to execute the registered handlers *synchronously*.

- **param** {*} data - Data to be passed into the pipeline for processing. Can be anything.
- **returns** {*} Transformed value from the pipeline.


## Example

Below is a pretty contrived example to illustrate the creation of a pipeline with three handlers, one of which returns a promise.

> NOTE: You generally want to use `runAsync`, unless you know that all the handlers are synchronous and you really need synchronous behavior.

``` javascript
var Pipeline = require('then-pipeline');
var pipeline = Pipeline([
  addHeader,
  addBody,
  addFooter
]);

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

# License MIT
