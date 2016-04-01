function Pipeline(transforms) {
  if (!(this instanceof Pipeline)) {
    return new Pipeline(transforms);
  }
  this._transforms = transforms || [];
}


Pipeline.create = function(transforms) {
  return new Pipeline(transforms);
};


Pipeline.prototype.use = function(transform) {
  this._transforms.push(transform);
  return this;
};


Pipeline.prototype.runAsync = function(data) {
  return Pipeline.runAsync(data, this._transforms);
};


Pipeline.prototype.runSync = function(data) {
  return Pipeline.runSync(data, this._transforms);
};


Pipeline.runAsync = function(data, transforms) {
  return Pipeline
    .createRunnables(transforms)
    .reduce(function runPipelineAsync(promise, runnable) {
      return promise.then(runnable);
    }, Promise.resolve(data));
};


Pipeline.runSync = function(data, transforms) {
  return Pipeline
    .createRunnables(transforms)
    .reduce(function runPipelineSync(result, runnable) {
      return runnable(result);
    }, data);
};


Pipeline.createRunnables = function(transforms) {
  var cancelled = false;
  function cancel() {
    cancelled = true;
  }

  return transforms.map(function(transform) {
    return function runnable(result) {
      if (cancelled) {
        return result;
      }

      return transform(result, cancel);
    };
  });
};


module.exports = Pipeline;
