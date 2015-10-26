import React from "react"
import {RelayQL, query, observe} from "relei"
import TodoList from "./todoList"
import TodoInput from "./todoInput"
import {addTodo, removeTodo} from "./mutations"

// let's declare that we are interested in user and
// user's to-do items (id and text)
const userIdAndTodoItems =
  RelayQL`
  fragment on User {
    id,
    todos(first: 1000) {
      edges {
        node {
          id,
          text
        }
      }
    }
  }`

// create query which fetches todos for the current user/viewer
const userTodoQuery =
  query(RelayQL`query UserTodos { viewer }`, {})


export default React.createClass({
  getInitialState() {
    return {todos: []}
  },

  componentDidMount() {
    // here we start observing user to-do items and their changes
    observe(userTodoQuery, {forceFetch: false}, userIdAndTodoItems, viewer => {
      this.setState({
        userId: viewer.id,
        todos: viewer.todos.edges.map(e => e.node)
      })
    })
  },

  createTodo(text) {
    // just call the mutation and Relay will handle the rest: the observer
    // in componentDidMount will be called when new to-do item is added
    addTodo({userId: this.state.userId}, {text})
  },

  removeTodo(id) {
    // same goes for remove
    removeTodo({userId: this.state.userId}, {id})
  },

  render() {
    return (
      <div>
        <h1>Todos</h1>
        <TodoInput onCreate={this.createTodo} />
        <TodoList
          todos={this.state.todos}
          onRemove={this.removeTodo}
          />
      </div>
    )
  }
})
