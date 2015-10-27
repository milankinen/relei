# Relei with Bacon.js

The full potential of `relei` is acquired when combining it with some
[Functional Reactive Programming](https://en.wikipedia.org/wiki/Functional_reactive_programming)
library like [Bacon.js](https://github.com/baconjs/bacon.js) (although some
people don't consider Bacon.js as FRP).

The most central file is `src/observeAsStream.js` which transforms the
`observe` function into event stream. This enables very powerful tools for
Relay query and fragment management.

For example we can have a parametrized user query and a fragment that includes
user's todo items:

```javascript
const queryUser =
  query(RelayQL`query UserTodos { viewer }`)

const userIdAndTodoItems =
  RelayQL`
  fragment on User {
    todos(first: 1000, status: $status) {
      edges {
        node {
          id,
          complete,
          text
        }
      }
    }
  }`
```
Now we can easily declare a property which contains user's todo items by using
the current status:

```javascript
const todoItemsP =
  statusP
    .map(status => ({status}))
    .map(queryUser)
    .flatMapLatest(query => observeAsStream(query, userIdAndTodoItems))
    .map(user => user.todos.edges.map(e => e.node))
```

All subscribing and unsubscribing logic is managed by event streams and only
thing you have to worry is the data you need.


## Usage

    npm i && npm start
    open http://localhost:3000/app/index.html
