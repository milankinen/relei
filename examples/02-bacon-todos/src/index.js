import {render} from "react-dom"
import {setEndpoint} from "relei"
import initApp from "./todoApp"

// this is needed because we are running GraphQL server
// under "/api/graphql" instead of default "/graphql"
setEndpoint("/api/graphql")

initApp().onValue(App => {
  render(App, document.getElementById("app"))
})
