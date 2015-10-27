import Bacon from "baconjs"
import {observe} from "relei"

export default function observeAsStream(query, fragment, options = {}) {
  return Bacon.fromBinder(sink => (
    observe(query, options, fragment, sink)
  ))
}
