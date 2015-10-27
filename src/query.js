import RelayQuery from "react-relay/lib/RelayQuery"
import RelayMetaRoute from "react-relay/lib/RelayMetaRoute"
import GraphQL from "react-relay/lib/GraphQL"

import curry from "./util/curry"


export default curry((q, variables) => {
  return (fragment) => {
    if (!q.name) {
      throw new Error("Missing query name! Relei supports only named queries")
    }

    const baseQuery =
      new GraphQL.Query(
        q.fieldName,
        (q.calls[0] && q.calls[0].value) || null,
        q.fields,
        [fragment],
        q.metadata,
        q.name
      )

    const rootQuery =
      RelayQuery.Root.create(
        baseQuery,
        RelayMetaRoute.get(q.name),
        variables || {}
      )

    return {
      root: rootQuery,
      base: baseQuery,
      variables
    }
  }
})
