import RelayStore from "react-relay/lib/RelayStore"
import RelayMutation from "react-relay/lib/RelayMutation"

import curry from "./util/curry"

class ReleiMutation extends RelayMutation {
  constructor(opts) {
    super({})
    this.releiOpts = opts
  }
  getMutation() {
    return this.releiOpts.mutation
  }
  getVariables() {
    return this.releiOpts.variables
  }
  getFatQuery() {
    return this.releiOpts.fatQuery
  }
  getConfigs() {
    const {ctx, variables} = this.releiOpts
    return this.releiOpts.configs(ctx, variables)
  }
}

class ReleiOptimisticMutation extends ReleiMutation {
  constructor(mutation, opts) {
    super(mutation, opts)
  }
  getOptimisticResponse() {
    const {ctx, variables} = this.releiOpts
    return this.releiOpts.optimisticResponse(ctx, variables)
  }
}


export default curry((opts, ctx, variables) => {
  const {mutation, fatQuery, configs, optimisticResponse} = opts
  if (!(mutation && fatQuery && configs)) {
    throw new Error(
      "Mandatory options missing! The following options must be given:\n"
      + "  * mutation\n"
      + "  * fatQuery\n"
      + "  * configs"
    )
  }
  const options = {...opts, ctx, variables}
  const releiMutation = optimisticResponse ?
    new ReleiOptimisticMutation(options) :
    new ReleiMutation(options)

  RelayStore.update(releiMutation)
})

