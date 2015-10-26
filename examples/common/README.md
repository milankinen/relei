# Example server and RelayQL plugin

These resources are shared among the examples

## Server

Usage:

    babel-node ../common/server

The server schema has been copied from
**[Relay TodoMVC example](https://github.com/facebook/relay/tree/v0.4.0/examples/todo)**


## RelayQL Babel plugin

Usage:

    browserify -t [ babelify --plugins '../common/rql' ] ...
    
    
