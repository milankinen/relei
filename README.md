# Relei

Simple, lightweight and reactive Relay client

[![npm version](https://badge.fury.io/js/relei.svg)](http://badge.fury.io/js/relei)

**OBS! OBS! This is project is far from stable, thus it's not recommended for production usage**

## Motivation

I started to look at the Facebook's [Relay](https://facebook.github.io/relay/)
and its examples. Umm... So much confusing and unnecessary stuff like root containers,
containers, routes...

If I've understood right, the core idea of Relay is simple - client just declares the
data it needs and Relay deals the fetching, caching and data changes. Let's just stick with
this idea and forget the rest!


## Installation

    npm i --save relei

NOTE: `react-relay` package defines `react` and `react-dom` as a peer dependency
which means that also these packages get installed. However, `relei` requires only
`relay` specific submodules so `react` and `react-dom` are not actually required at all.


## Usage

Query example:
```javascript
import {RelayQL, query, observe} from "relei"

// fragments are like projections: the define the fields that should
// be returned to the client: only changes to these fields trigger the
// observers
const fragment =
  RelayQL`
  fragment on User {
    id,
    todos(first: 100) {
      edges {
        node {
          id,
          text
        }
      }
    }
  }`

// queries define which objects should be fetched/observed: only changes
// to these objects trigger the observers
// queries can be parametrized with variables
const variables = {}
const viewerTodos =
  query(RelayQL`query ViewerTodos { viewer }`, variables)

// data can be observed by combining query and fragment: every time when
// the data changes, the observer function will be invoked with the new value
// BUT ONLY IF the data is associated with the query AND the fragment
const options = {forceFetch: false}
observe(viewerTodos, options, fragment, (value) => {
  const todos = value.todos.edges.map(t => t.node)
  console.log("Got todos", todos)
})
```

Mutation example:
```javascript
import {RelayQL, mutate} from "relei"

// Relei mutations behave like Relay mutations. The only difference is that Relei
// API uses curried functions instead of ES6 classes
// See more mutation specs from
// https://facebook.github.io/relay/docs/guides-mutations.html#content
const addTodo = mutate({
  mutation: RelayQL`mutation { addTodo }`,
  fatQuery: RelayQL`
      fragment on AddTodoPayload {
        todoEdge,
        viewer {
          todos,
          totalCount,
        },
      }`,
  configs: (context) => (
    [{
      type: "RANGE_ADD",
      parentName: "viewer",
      parentID: context.viewerId,
      connectionName: "todos",
      edgeName: "todoEdge",
      rangeBehaviors: {
        "": "append",
        "status(any)": "append",
        "status(active)": "append",
        "status(completed)": null
      }
    }]
  )
})

// after we've defined the mutation, we can use it by giving the context (that can be used
// to form the local mutation) and variables (= mutation parameters that are sent to server)
const context = { viewerId: "1234" }
const variables = { text: "Tsers!" }
addTodo(context, variables)
```

## API

All API functions are [curried](https://en.wikipedia.org/wiki/Currying).

#### `RelayQL`

Just an alias to `Relay.QL` (but it doesn't import all Relay and React stuff,
that would be included if you used `import Relay from "react-relay"`).

#### `query`

```javascript
// query :: (Relay.QL, {variables...}) => LazyQuery
```
Creates a lazy query and binds the given query variables into it. The returned
lazy query (actually a function that takes a fragment as an input) can be used
with `observe` function.

```javascript
// can be used without currying
const rebels = query(RelayQL`query FactionsQuery { factions(names: $names) }`, {names: ["rebels"]})

// or with it
const factionsByName = query(RelayQL`query FactionsQuery { factions(names: $names) }`)
const rebels = factionsByName(["rebels"])
const empire = factionsByName(["empire"])
```

#### `observe`

```javascript
// observe :: (LazyQuery, {options...}, fragment, listenFn) => unsubscribeFn
```
Subscribes an observer which listens data changes that are associated to the given
query and fragment. The observer behaviour can be configured by using options.

```javascript
const factionName = RelayQL`
  fragment on Faction @relay(plural: true) {
    name
  }`
const factionShips = RelayQL`
  fragment on Faction @relay(plural: true) {
    ships(first: 10) {
      edges {
        node {
          name
        }
      }
    }
  }`

const options = {}

// can be used without currying
observe(rebels, options, factionShips, (value) => {
  console.log("Rebel ships", value)
})

// or with it
const observeEmpire = observe(empire, options)
observeEmpire(factionShips, (value) => {
  console.log("Empire ships", value)
})
observeEmpire(factionName, (value) => {
  console.log("Empire name", value)
})
```

Observer can be unsubscribed by using the `ubsubscribe` function that is returned
by `observe`:

```javascript
const unsubscribe = observe(rebels, {}, factionShips, (value) => {
  console.log("Rebel ships", value)
})

setTimeout(() => unsubscribe(), 10000)
```

Possible options:

  * `forceFetch`: Boolean, default `false`. See Relay docs for more info

#### `mutate`

```javascript
// mutate :: ({mutation, fatQuery, configs[, optimisticResponse]}, {context...}, {variables...}) => void
```

Executes a mutation and triggers the observers when the mutation completes. See
[Relay mutation documentation](https://facebook.github.io/relay/docs/guides-mutations.html#content)
for more information.

```javascript
// also "mutate" can be used with or without curring but because mutations usually
// require context and variables, it's advice to define mutation without context
// and variables and then "parametrize" it afterwards

// all of the following fields are mandatory
// see specs from https://facebook.github.io/relay/docs/guides-mutations.html#content
const addTodo = mutate({
  mutation: RelayQL`mutation { addTodo }`,
  fatQuery: RelayQL`
      fragment on AddTodoPayload {
        todoEdge,
        viewer {
          todos,
          totalCount,
        },
      }`,
  configs: (context, variables) => (
    [{
      type: "RANGE_ADD",
      parentName: "viewer",
      parentID: context.viewerId,
      connectionName: "todos",
      edgeName: "todoEdge",
      rangeBehaviors: {
        "": "append",
        "status(any)": "append",
        "status(active)": "append",
        "status(completed)": null
      }
    }]
  )
})

// now the mutation can be executed by giving the context and variables
//  * context can be used to define the client side effects
//  * variables are sent to the server
const context = {viewerId: "1234"}
const variables = {text: "Tsers!"}
addTodo(context, variables)
```

`mutate` supports (optional) optimistic updates with `optimisticResponse` field:
```javascript
// see https://facebook.github.io/relay/docs/guides-mutations.html#optimistic-updates
const addTodo = mutate({
  mutation: RelayQL`mutation { addTodo }`,
  fatQuery: RelayQL`... same as before ...`,
  configs: (context, variables) => ( /* ... same as before ... */ ),
  optimisticResponse: (context, variables) => ({
    todoEdge: {
        node: {
          complete: false,
          text: variables.text,
        },
      },
      viewer: {
        id: context.viewerId
      },
  })
})

addTodo({viewerId: "1234"}, {text: "Tsers!"})
```


## License

MIT

## Contributing

Yes please!
