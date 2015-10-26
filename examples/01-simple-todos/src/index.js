import React from "react"
import {render} from "react-dom"
import {setEndpoint} from "relei"
import App from "./todoApp"

// this is needed because we are running GraphQL server
// under "/api/graphql" instead of default "/graphql"
setEndpoint("/api/graphql")

render(<App />, document.getElementById("app"))
