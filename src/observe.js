import RelayQuery from "react-relay/lib/RelayQuery"
import RelayMetaRoute from "react-relay/lib/RelayMetaRoute"
import RelayStore from "react-relay/lib/RelayStore"
import RelayStoreData from "react-relay/lib/RelayStoreData"
import GraphQLStoreQueryResolver from "react-relay/lib/GraphQLStoreQueryResolver"
import GraphQLFragmentPointer from "react-relay/lib/GraphQLFragmentPointer"

import curry from "./util/curry"

const storeData = RelayStoreData.getDefaultInstance()

export default curry((q, opts, fragment, onValue) => {
  const {root, base: {name}, variables} = q(fragment)
  const options = opts || {}

  let resolver = null,
    request  = null

  request = options.forceFetch === true ?
    RelayStore.forceFetch({[name]: root}, handleStatusChange) :
    RelayStore.primeCache({[name]: root}, handleStatusChange)

  return function unsubscribe() {
    if (request) {
      request.abort()
      request = null
    }
    if (resolver) {
      resolver.reset()
      resolver = null
    }
  }

  function handleStatusChange(status) {
    if (status.ready) {
      // get fragment pointers from query
      const fp =
        GraphQLFragmentPointer.createForRoot(
          storeData.getQueuedStore(),
          root
        )

      const relayFragment =
        RelayQuery.Fragment.create(
          fragment,
          RelayMetaRoute.get(name),
          variables
        )

      const graphqlFP =
        relayFragmentToGraphQLFP(fp, relayFragment)

      const handleUpdate = () => {
        if (resolver) {
          const val = resolver.resolve(graphqlFP)
          onValue(val)
        }
      }

      resolver = new GraphQLStoreQueryResolver(graphqlFP, handleUpdate)
      handleUpdate()
    }
    // TODO: error handling
  }

  function relayFragmentToGraphQLFP(rootFP, relayFragment) {
    const ids = getFragmentIds(rootFP, relayFragment)
    return new GraphQLFragmentPointer(ids, relayFragment)
  }

  function getFragmentIds(fp, relayFragment) {
    const fid = relayFragment.getConcreteFragmentID()
    if (relayFragment.isPlural()) {
      return fp.reduce((acc, it) => [...acc, ...it[fid].getDataIDs()], [])
    } else {
      return fp[fid].getDataID()
    }
  }
})
