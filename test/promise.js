/*!
 *
 *      ######
 *    # #     # #####   ####  #    # #  ####  ######
 *    # #     # #    # #    # ##  ## # #      #
 *    # ######  #    # #    # # ## # #  ####  #####
 *    # #       #####  #    # #    # #      # #
 *    # #       #   #  #    # #    # # #    # #
 *    # #       #    #  ####  #    # #  ####  ######
 *
 * @author Szymon Działowski
 * @ver 1.0 - 2014-09-02
 * @homepage https://github.com/stopsopa/ipromise
 * @spec http://promisesaplus.com/
 * @demo http://stopsopa.bitbucket.org/demos/ipromise/demo.html
 *
 * Copyright (c) 2014 Szymon Działowski
 * Released under the MIT license
 * http://en.wikipedia.org/wiki/MIT_License
 */
;(function (name, context, definition) {
  if (typeof global === 'object')
    global[name] = definition;

  if (typeof module === 'object' && module.exports)
    module.exports = definition;

  context[name] = definition;

})('ipromise', this, (function (_, u) {

  // statuses
  for (var i in _) _[_[i]] = i;

  // tools
  function _aconv(a) {
    return Array.prototype.slice.call( a, 0 );
  };
  function isArray (a) {
    return toString.call(a) == '[object Array]';
  };
  function isObject (a) {
    return toString.call(a) == '[object Object]';
  };
  function isFunction (a) { // from underscore.js
    return typeof a == 'function' || false;
  };

  var _tick = (function(){
    try{return process.nextTick}catch(e){};
    try{setImmediate(function(){});return setImmediate}catch(e){};
    return function(f){setTimeout(f,0)};
  })();

  function _flatcycle(l, a) {
    var e;
    for (var i = 0 ; i < a.length ; ++i ) {
      e = a[i];
      if (isFunction(e))  // If onFulfilled is not a function, it must be ignored. - http://promisesaplus.com/#point-24 / onRejected is not a function, it must be ignored. - http://promisesaplus.com/#point-25
        l.push(e);
      else if (isArray(e))
        _flatcycle(l, e);
    }
    return l;
  };
  function _flat(a) { return _flatcycle([], _aconv(a)); };
  function _stack(stack, args, status) {
    var a = _flat(args);
    for (var i = 0 ; i < a.length ; ++i ) {
      a[i].status = status;
      stack.push(a[i]);
    }
  };
  function _resolve(promise, x) {  // logic from http://promisesaplus.com/#point-45
    try {
      if (promise === x) // If promise and x refer to the same object, reject promise with a TypeError as the reason. - http://promisesaplus.com/#point-48
        throw new TypeError('promise and x are the same object'); // If promise and x refer to the same object, reject promise with a TypeError as the reason. - http://promisesaplus.com/#point-48

      if (isObject(x) || isFunction(x)) {
        var then = x.then;
        if (isFunction(then)) {
          var call = true;
          try {
            then.call(x, function (y) {
              if (call) {
                call = false;
                _resolve(promise, y);
              }
            }, function (r) {
              if (call) {
                call = false;
                promise.reject(r);
              }
            });
          }
          catch (e) {
            call && promise.reject(e);
          }
        }
        else promise.resolve(x);
      }
      else promise.resolve(x);
    }
    catch (e) {
      promise.reject(e);
    }
  };
  function _trigger(fn, args) {
    _tick(function () { // onFulfilled or onRejected must not be called until the execution context stack contains only platform code. [3.1]. - http://promisesaplus.com/#point-34
      if (fn.promise) {
        try {
          // If either onFulfilled or onRejected returns a value x, run the Promise Resolution Procedure [[Resolve]](promise2, x) - http://promisesaplus.com/#point-41
          // it must be called after promise is fulfilled, with promise’s value as its first argument. - http://promisesaplus.com/#point-27 and http://promisesaplus.com/#point-31
          _resolve(fn.promise, fn.apply(u, args));
        }
        catch (e) { // http://promisesaplus.com/#point-48
          fn.promise.reject(e); // If either onFulfilled or onRejected throws an exception e, promise2 must be rejected with e as the reason. - http://promisesaplus.com/#point-42
        }
        return;
      }
      fn.apply(u, args); // normal or progress mode
    });
  };
  function _triggerstack(l, s, args) {
    for (var i = 0 ; i < l.length ; ++i )
      (!s || (l[i].status & s)) && _trigger(l[i], args);
  };
  return function deferred() {

    if (this.constructor != deferred)
      return new deferred();

    var state = _.PENDING, // pending, resolved, or rejected // A promise must be in one of three states: pending, fulfilled, or rejected. - http://promisesaplus.com/#point-11
      argscache, // must have a value, which must not change. - http://promisesaplus.com/#point-16 / must have a reason, which must not change. - http://promisesaplus.com/#point-19
      progresscache,
      stack = [];
    // A promise must provide a then method to access its current or eventual value or reason. - http://promisesaplus.com/#point-21
    // then may be called multiple times on the same promise. - http://promisesaplus.com/#point-36
    this.then = function (onFulfilled, onRejected) { // A promise’s then method accepts two arguments: - http://promisesaplus.com/#point-22
      var prms = new deferred();

      // Both onFulfilled and onRejected are optional arguments: - http://promisesaplus.com/#point-23
      isFunction(onFulfilled) || (onFulfilled = function () { // If onFulfilled is not a function and promise1 is fulfilled, promise2 must be fulfilled with the same value as promise1. - http://promisesaplus.com/#point-43
        prms.resolve.apply(u, arguments);
      });

      isFunction(onRejected) || (onRejected = function () { // If onRejected is not a function and promise1 is rejected, promise2 must be rejected with the same reason as promise1. - http://promisesaplus.com/#point-44
        prms.reject.apply(u, arguments);
      });

      onFulfilled.promise = onRejected.promise = prms;

      // If/when promise is fulfilled, all respective onFulfilled callbacks must execute in the order of their originating calls to then. - http://promisesaplus.com/#point-37
      // If/when promise is rejected, all respective onRejected callbacks must execute in the order of their originating calls to then. - http://promisesaplus.com/#point-38
      this.done(onFulfilled).fail(onRejected);

      return prms; // then must return a promise - http://promisesaplus.com/#point-40
    };
    this.resolve = function () { // When pending, a promise: may transition to either the fulfilled or rejected state. - http://promisesaplus.com/#point-12
      if (state == _.PENDING) { // must not transition to any other state. - http://promisesaplus.com/#point-15
        state     = _.RESOLVED;
        argscache = _aconv(arguments);
        _triggerstack(stack, _.DONE, argscache);
        delete stack; // i don't need stack anymore
      }
      return this;
    };
    this.reject = function () { // When pending, a promise: may transition to either the fulfilled or rejected state. - http://promisesaplus.com/#point-12
      if (state == _.PENDING) { // must not transition to any other state. - http://promisesaplus.com/#point-18
        state     = _.REJECTED;
        argscache = _aconv(arguments);
        _triggerstack(stack, _.FAIL, argscache);
        delete stack; // i don't need stack anymore
      }
      return this;
    };
    this.done = function () {
      (state == _.PENDING)  && _stack(stack, arguments, _.DONE); // it must not be called before promise is fulfilled. - http://promisesaplus.com/#point-28
      (state == _.RESOLVED) && _triggerstack(_flat(arguments), u, argscache);
      return this;
    };
    this.fail = function () {
      (state == _.PENDING)  && _stack(stack, arguments, _.FAIL); // it must not be called before promise is rejected. - http://promisesaplus.com/#point-32
      (state == _.REJECTED) && _triggerstack(_flat(arguments), u, argscache);
      return this;
    };
    this.progress = function () {
      if (state == _.PENDING) _stack(stack, arguments, _.PROGRESS);
      else                    _triggerstack(_flat(arguments), u, progresscache);
      return this;
    };
    this.always = function () {
      if (state == _.PENDING) _stack(stack, arguments, _.DONE | _.FAIL, argscache)
      else                    _triggerstack(_flat(arguments), u, argscache)
      return this;
    };
    this.notify = function () {
      progresscache = _aconv(arguments);
      (state == _.PENDING) && _triggerstack(stack, _.PROGRESS, progresscache);
      return this;
    };
    this.state = function () {
      return _[state].toLowerCase();
    };
    return this;
  };
})({
  PENDING  : 1,
  RESOLVED : 2,
  REJECTED : 4,
  DONE     : 8,
  FAIL     : 16,
  PROGRESS : 32
}));
