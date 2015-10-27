import React from "react"

export default React.createClass({
  render() {
    return (
      <ul>
        {this.props.todos.map(it => (
          <li key={it.id}>
            {it.text}
            <button onClick={() => this.props.onRemove(it.id)}>remove</button>
          </li>
        ))}
      </ul>
    )
  }
})
