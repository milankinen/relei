import express from "express"
import path from "path"
import graphQLHttp from "express-graphql"
import {schema} from "./data/schema"

const APP_PORT = 3010

// Expose a GraphQL endpoint and serve static resources
const app = express()
app.use("/api", graphQLHttp({schema, pretty: true}))
app.use("/app", express.static(path.resolve(__dirname, "public")))
app.listen(APP_PORT, () => console.log("Test server started, port", APP_PORT))

