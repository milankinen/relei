import React from "react"

export default React.createClass({
  getInitialState() {
    return {text: ""}
  },

  handleAdd() {
    if (this.state.text) {
      this.props.onCreate(this.state.text)
      this.setState({text: ""})
    }
  },

  render() {
    return (
      <div>
        <input
          placeholder="Create new todo item..."
          onChange={e => this.setState({text: e.target.value})}
          value={this.state.text}
          />
        <button onClick={this.handleAdd}>Add todo</button>
      </div>
    )
  }
})
