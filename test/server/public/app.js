import {RelayQL, setEndpoint, query, subscribe} from "../../../src/main"

setEndpoint("/api/graphql")


const fragment =
  RelayQL`
    fragment on Faction @relay(plural: true) {
      id,
      name
    }
  `

const factionsByNames =
  query(RelayQL`
    query FactionsByName {
      factions(names: $names)
    }
  `)


const subscribeToEmpireAndRebels =
  subscribe(factionsByNames({names: ["empire", "rebels"]}), {})


console.log("subscribe to id & name")
var unsub =
  subscribeToEmpireAndRebels(fragment, (value) => {
    console.log("got value", value)
    window.__results = value
    unsub()
  })
