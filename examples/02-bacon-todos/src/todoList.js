import React from "react"
import {RelayQL, query} from "relei"
import {removeTodo, changeTodoStatus} from "./mutations"
import observeAsStream from "./observeAsStream"

const queryUser =
  query(RelayQL`query UserTodos { viewer }`)

const userIdAndTodoItems =
  RelayQL`
  fragment on User {
    id,
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


function todosP(statusP) {
  return statusP
    .map(status => ({status}))
    .map(queryUser)
    .flatMapLatest(query => observeAsStream(query, userIdAndTodoItems))
    .map(user => ({
      userId: user.id,
      todos: user.todos.edges.map(e => e.node)
    }))
}

export default function initList(status) {
  return todosP(status)
    .map(({userId, todos}) => (
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            {todo.text} : {todo.complete ? "COMPLETE" : "ACTIVE"}
            {renderToggleStatusBtn(userId, todo)}
            {renderRemoveBtn(userId, todo)}
          </li>
        ))}
      </ul>
    ))

  function renderToggleStatusBtn(userId, {id, complete}) {
    return (
      <button onClick={() => changeTodoStatus({userId}, {id, complete: !complete})}>
        Mark as {!complete ? "complete" : "active"}
      </button>
    )
  }
  function renderRemoveBtn(userId, {id}) {
    return (
      <button onClick={() => removeTodo({userId}, {id})}>
        remove
      </button>
    )
  }
}

