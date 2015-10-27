# Simple Relei usage

This example demonstrates the basic `relei` usage with vanilla React.

The most interesting part is in the `componentDidMount` method in `todoApp.js`. 
When `App` component gets mounted, we start observing the current viewer's 
todo items. Every time when these todo items change, the observer callback is 
invoked and the new items are set to component state with `setState`.

When new items are added or existing items are removed, Relay handles the mutation
and triggers the observer automatically.

## Usage

    npm i && npm start
    open http://localhost:3000/app/index.html
        
