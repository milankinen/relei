# Relei

Relay client for simple persons (like me)

[![npm version](https://badge.fury.io/js/relei.svg)](http://badge.fury.io/js/relei)

**OBS! OBS! This is project is in a proof-of-concept stage so I don't promise that
things are working yet!!**

## Motivation

I started to look at the Facebook's [Relay](https://facebook.github.io/relay/)
and its examples. I understood nothing. So many confusing things like routes,
queries, fragments, root containers, containers...

The core idea of Relay is simple - client declares what data it likes and the
Relay abstracts the rest. Let's keep it in that way!

## Usage

    npm i --save react relei
    
Code example:

```javascript
import {RelayQL, query, observe} from "relei"

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


observeEmpireAndRebels(fragment, (value) => {
  console.log("Got updated value", value)
})
```


## API

All methods are curried

#### `RelayQL` 

Just a delegate to `Relay.QL` (but it doesn't import all Relay shit 
unlike `import Relay from "react-relay"`)

#### `query :: (GraphQL.Query, variables) => Relei.LazyQuery`

Creates a lazy query and binds the given query variables into it.

#### `observe :: (Relei.LazyQuery, opts, GraphQL.Fragment, onValue) => unsubscribe`

Subscribes an observer to the lazy query with given options and Fragment.
The `onValue` callback is invoked automatically every time when new value
arrives (either initial data or if the observed data changes).


This function returns a function which unsubscibes the observer.

Options:

  * `forceFetch`: Boolean, default `false`
  

## License

MIT

## Contributing

Yes please!
