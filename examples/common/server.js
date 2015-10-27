import express from "express"
import path from "path"
import graphQLHttp from "express-graphql"
import {schema} from "./data/schema"

const app = express()
const port = 3000
const staticDir = process.cwd()

console.log(staticDir)

app.use("/api", graphQLHttp({schema, pretty: true}))
app.use("/app", express.static(staticDir))
app.listen(port, () => console.log("Server started, port", port))
