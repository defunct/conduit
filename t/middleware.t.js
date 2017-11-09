require('proof')(1, require('cadence')(prove))

function prove (async, okay) {
    var Procession = require('procession')

    var Client = require('../client')
    var Server = require('../server')

    var Middleware = require('../middleware')
    var Requester = require('../requester')

    var client = new Client
    var requester = new Requester(client)
    var middleware = new Middleware(server, function (request, response) {
        response.writeHead(200, { 'content-type': 'text/plain', connection: 'close' })
        response.end('hello, world')
    })
    var server = new Server(middleware, 'socket')

    client.read.shifter().pump(server.write, 'enqueue')
    server.read.shifter().pump(client.write, 'enqueue')

    var http = require('http')
    var Destructible = require('destructible')
    var UserAgent = require('vizsla')
    var ua = new UserAgent

    var destructible = new Destructible(5000, 't/middleware')

    var server = http.createServer(function (request, response) {
        requester.middleware(request, response, destructible.rescue('request'))
    })

    destructible.completed.wait(async())

    middleware.listen(destructible.monitor('middleware'))
    destructible.addDestructor('middleware', middleware, 'destroy')

    var delta = require('delta')

    async([function () {
        destructible.destroy()
    }], function () {
        server.listen(8888, '127.0.0.1', async())
    }, function () {
        delta(destructible.monitor('server')).ee(server).on('close')
        destructible.addDestructor('server', server, 'close')
        ua.fetch({
            url: 'http://127.0.0.1:8888'
        }, async())
    }, function (body, response) {
        console.log(response.headers)
        okay(body, 'hello, world', 'index')
    })
}