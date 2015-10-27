import RelayDefaultNetworkLayer from "react-relay/lib/RelayDefaultNetworkLayer"
import RelayNetworkLayer from "react-relay/lib/RelayNetworkLayer"

export default (endpoint) => {
  RelayNetworkLayer.injectNetworkLayer(new RelayDefaultNetworkLayer(endpoint))
}

