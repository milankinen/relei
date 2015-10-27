import React from "react"

export default function initFilter(statusP, setStatus) {
  return statusP.map(status => (
    <div>
      Show items with status:
      <select onChange={e => setStatus(e.target.value)} value={status}>
        <option value="any">ANY</option>
        <option value="active">ACTIVE</option>
        <option value="completed">COMPLETED</option>
      </select>
    </div>
  ))
}
