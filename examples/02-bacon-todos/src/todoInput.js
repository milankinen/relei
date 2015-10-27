import React from "react"
import {RelayQL, query} from "relei"
import {createAction} from "megablob"
import {addTodo} from "./mutations"
import observeAsStream from "./observeAsStream"

const queryUser =
  query(RelayQL`query UserTodos { viewer }`, {})

const onlyUserId =
  RelayQL`fragment on User { id }`


export default function initInput() {
  const setText = createAction()
  const userIdS = observeAsStream(queryUser, onlyUserId)

  return setText.$
    .toProperty("")
    .combine(userIdS, (text, {id: userId}) => (
      <div>
        <input
          placeholder="Create new todo item..."
          onChange={e => setText(e.target.value)}
          value={text}
          />
        <button onClick={() => { addTodo({userId}, {text}); setText("") }}>Add todo</button>
      </div>
    ))
}
