import Promise from "bluebird"
import {exec}  from "shelljs"

export function startServer() {
  exec("npm run create-test-bundle")
  return exec("npm run start-test-server", {async: true})
}

export function await(time) {
  return new Promise(resolve => setTimeout(resolve, time))
}
