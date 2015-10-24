import {RelayQL, setEndpoint, query, observe} from "../../../src/main"

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


const observeEmpireAndRebels =
  observe(factionsByNames({names: ["empire", "rebels"]}), {})


console.log("subscribe to id & name")
var unsub =
  observeEmpireAndRebels(fragment, (value) => {
    console.log("got value", value)
    window.__results = value
    unsub()
  })
