kurento-monitor is a simple application that retrieves a few information
about the media elements running in the Kurento Media Server in a given
moment, such as pipelines, player endpoints, rtp endpoints, etc.

The retrieved data is printed to the standard output in a JSON format

#Installing
```
npm install

```
#Options
`reject_self_signed : 0` allows monitor accept unauthorized (self-signed)
    certificates

`pipelines_only : 1` monitor will output only the number of pipelines

`graph_only : 1` monitor will output the DOT graph, instead of server JSON's

`keep_monitoring : 1` tells monitor to keep monitoring until CTRL+c/SIGINT
    signal is received. Otherwise, monitor will run and output it's data
    one single time

`info_interval: 2000` set interval (ms) for the `keep_monitoring` option

`space_width :` Number of white spaces used as identation to print the output.
Ignored when `pipelines_only` is set to 1

`file_output : 1` monitor will also output it's data to a '.out' file

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
