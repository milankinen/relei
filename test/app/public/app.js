import {RelayQL, setEndpoint, query, observe, mutate} from "../../../index"

setEndpoint("/api/graphql")

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

const viewersTodos =
  query(RelayQL`query ViewerTodos { viewer }`, {})

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
  configs: ({viewerId}) => (
    [{
      type: "RANGE_ADD",
      parentName: "viewer",
      parentID: viewerId,
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


const observeTodosWith = observe(viewersTodos, {forceFetch: false})

let calls = 0
window._todos = []

console.log("observe")
observeTodosWith(fragment, (value) => {
  const todos = value.todos.edges.map(t => t.node)
  console.log("got todos", todos)
  window._todos[calls++] = todos
})


setTimeout(() => {
  console.log("add new todo")
  addTodo({viewerId: "VXNlcjptZQ=="}, {text: "tsers!"})
}, 1000)
