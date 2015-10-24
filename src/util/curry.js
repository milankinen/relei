
export default function curry(fn) {
  var n = fn.length
  switch (n) {
    case 0:
    case 1:  return fn
    case 2:  return curry2(fn)
    case 3:  return curry3(fn)
    default: return curryN(fn)
  }
}

function curry2(fn) {
  return (function curried(arg0, arg1) {
    var n = arguments.length
    ensureHasArgs(n)
    if (n === 1) {
      return (function(arg1) { return fn(arg0, arg1) })
    } else {
      return fn(arg0, arg1)
    }
  })
}

function curry3(fn) {
  return (function curried(arg0, arg1, arg2) {
    var n = arguments.length
    ensureHasArgs(n)
    if (n === 1) {
      return (function(arg1, arg2) {
        var m = arguments.length
        ensureHasArgs(m)
        if (m === 1) {
          return (function(arg2) { return fn(arg0, arg1, arg2) })
        } else {
          return fn(arg0, arg1, arg2)
        }
      })
    } else if (n === 2) {
      return (function (arg2) {
        var m = arguments.length
        ensureHasArgs(m)
        return fn(arg0, arg1, arg2)
      })
    } else {
      return fn(arg0, arg1, arg2)
    }
  })
}

function curryN(fn) {
  return (function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args)
    } else {
      return (function(...rest) {
        return curried.apply(this, args.concat(rest))
      })
    }
  })
}

function ensureHasArgs(n) {
  if (n === 0) {
    throw new Error("At least one argument expected")
  }
}
