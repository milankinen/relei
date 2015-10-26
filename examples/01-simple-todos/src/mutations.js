import {RelayQL, mutate} from "relei"


export const addTodo = mutate({
  mutation: RelayQL`mutation { addTodo }`,
  fatQuery: RelayQL`
      fragment on AddTodoPayload {
        todoEdge,
        viewer {
          todos
        },
      }`,
  configs: ({userId}) => (
    [{
      type: "RANGE_ADD",
      parentName: "viewer",
      parentID: userId,
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

export const removeTodo = mutate({
  mutation: RelayQL`mutation { removeTodo }`,
  fatQuery: RelayQL`
      fragment on RemoveTodoPayload {
        deletedTodoId,
        viewer
      }`,
  configs: ({userId}) => (
    [{
      type: "NODE_DELETE",
      parentName: "viewer",
      parentID: userId,
      connectionName: "todos",
      deletedIDFieldName: "deletedTodoId"
    }]
  )
})

