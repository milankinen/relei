var Promise = require("./promise")
var page = require("webpage").create()

page.open("http://localhost:3010/app/index.html", function (status) {
  if (status !== "success") {
    phantom.exit(1)
  } else {
    start()
      .then(function() {
        return waitFor("test initial fetch ok", function() {
          var todos = page.evaluate(function() { return window._todos })
          return todos[0] && todos[0].length === 2
        })
      })
      .then(function() {
        return waitFor("mutation ok", function() {
          var todos = page.evaluate(function() { return window._todos })
          return todos[1] && todos[1].length === 3
        })
      })
      .then(function() {
        console.log("all ok")
        phantom.exit(0)
      })
      .fail(function(error) {
        console.log("got error: " + error)
        phantom.exit(1)
      })
      .done()
  }
})


function start() {
  var promise = new Promise()
  setTimeout(function() { promise.resolve(null) }, 1)
  return promise
}

function waitFor(name, testFn) {
  var promise = new Promise()
  var timeout = 3000
  var start = Date.now()
  var ok = false
  var interval = setInterval(function () {
    if ((Date.now() - start < timeout) && !ok) {
      ok = testFn()
    } else {
      if (!ok) {
        promise.reject(name + " timeout")
      } else {
        clearInterval(interval)
        promise.resolve(null)
      }
    }
  }, 100)
  return promise
}
