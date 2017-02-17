kurento-monitor is a simple application that retrieves a few information
about the media elements running in the Kurento Media Server in a given
moment, such as pipelines, player endpoints, rtp endpoints, etc.

The retrieved data is printed to the standard output in a JSON format

#Installing
```
npm install
```

#Running
```
node server <Websocket-URI>
```
Where Websocket-URI is the ws/wss URI of the kurento media server.

#Example
```
node server wss://127.0.0.1:8443/kurento
```

I called this app kurento-monitor because i used it when i had to monitor
the status of the Kurento Media Server while running a few other
applications. This app was handy to check if those apps were using too much
resources and correctly opening/closing media elements.
