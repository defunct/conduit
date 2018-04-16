// Control-flow utilities.
var cadence = require('cadence')

// An evented message queue.
var Procession = require('procession')

var assert = require('assert')

var Destructible = require('destructible')

function Multiplexer (routes) {
    this.outbox = new Procession
    this.inbox = new Procession
    this._routes = {}
}

Multiplexer.prototype._monitor = cadence(function (async, destructible, routes) {
    async(function () {
        this.inbox.shifter().pump(this, '_dispatch', destructible.monitor('dispatch'))
        async.forEach(function (qualifier) {
            var receiver = this._routes[qualifier] = routes[qualifier]
            var shifter = receiver.outbox.shifter()
            destructible.destruct.wait(shifter, 'destroy')
            shifter.pump(this, function (envelope) {
                this._envelop(qualifier, envelope)
            }, destructible.monitor([ 'receiver', 'envelop', qualifier ]))
        })(Object.keys(routes))
    }, function () {
        return [ this ]
    })
})

Multiplexer.prototype._dispatch = cadence(function (async, envelope) {
    if (envelope == null) {
        async.forEach(function (qualifier) {
            this._routes[qualifier].inbox.enqueue(null, async())
        })(Object.keys(this._routes))
    } else if (
        envelope.module == 'conduit/multiplexer' &&
        envelope.method == 'envelope' &&
        this._routes[envelope.qualifier] != null
    ) {
        this._routes[envelope.qualifier].inbox.enqueue(envelope.body, async())
    }
})

Multiplexer.prototype._envelop = function (qualifier, envelope) {
    this.outbox.push({
        module: 'conduit/multiplexer',
        method: 'envelope',
        qualifier: qualifier,
        body: envelope
    })
}

module.exports = cadence(function (async, destructible, routes) {
    new Multiplexer()._monitor(destructible, routes, async())
})
