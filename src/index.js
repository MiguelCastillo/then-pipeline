function Pipeline(handlers) {
  if (!(this instanceof Pipeline)) {
    return new Pipeline(handlers);
  }
  this._handlers = handlers || [];
}


Pipeline.create = function(handlers) {
  return new Pipeline(handlers);
};


Pipeline.prototype.use = function(handler) {
  this._handlers.push(handler);
  return this;
};


Pipeline.prototype.runAsync = function(data) {
  return this.getRunnables().reduce(function runPipelineAsync(promise, runnable) {
    return promise.then(runnable);
  }, Promise.resolve(data));
};


Pipeline.prototype.runSync = function(data) {
  return this.getRunnables().reduce(function runPipelineSync(result, runnable) {
    return runnable(result);
  }, data);
};


Pipeline.prototype.getRunnables = function() {
  var cancelled = false;
  function cancel() {
    cancelled = true;
  }

  return this._handlers
    .map(function(handler) {
      return function runnable(result) {
        if (cancelled) {
          return result;
        }

        return handler(result, cancel);
      };
    });
};


module.exports = Pipeline;