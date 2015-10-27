import React from "react"
import Bacon from "baconjs"
import {createAction} from "megablob"
import TodoFilter from "./todoFilter"
import TodoList from "./todoList"
import TodoInput from "./todoInput"


export default function initTodoApp() {
  const setStatus = createAction()
  const status = setStatus.$.toProperty("any")

  return Bacon
    .combineAsArray([TodoInput(), TodoList(status), TodoFilter(status, setStatus)])
    .map(([$input, $list, $filter]) => (
      <div>
        <h1>Todos</h1>
        {$input}
        {$list}
        {$filter}
      </div>
    ))
}
