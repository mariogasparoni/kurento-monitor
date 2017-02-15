const config = require('config')
const kurento = require('kurento-client')

process.env.NODE_TLS_REJECT_UNAUTHORIZED=0;

function getKurentoClient(callback) {
    var wsUri = config.get('kurento.server.uri')

    kurento(wsUri, function(err, _kurentoClient) {
        if (err) {
            console.log("Could not find media server at address " + wsUri);
            return callback("Could not find media server at address " + wsUri
                + ". Exiting with error " + err);
        }

        callback(null, _kurentoClient);
    });
}


function getPipelinesInfo(server, callback) {
    if (!server) {
        return callback(null);
    }

    var _pipelines = {};

    server.getPipelines(function(error,pipelines){
        if (error || (pipelines && pipelines.length < 1)) {
            return callback(null)
        }

        var childsCounter = 0;
        pipelines.forEach(function(p,index,array){
            /*p.getGstreamerDot(function(error,graph){
                console.log('GRAPH:\n',graph)
            })*/

            p.getChilds(function(error,elements){
                //add child elements to pipeline
                this.childs = elements
                //append pipeline+childs to _pipelines
                _pipelines[childsCounter] = this
                childsCounter++;
                if(childsCounter == array.length) {
                    //last child got, return
                    return callback(_pipelines)
                }
            })
        })
    })
}

getKurentoClient(function(err, _kurentoClient) {
    if (err) {
        console.log('Init failed to load kurentoClient ' + err);
        return;
    }

    _kurentoClient.getServerManager(function (error,server) {
        if (error) {
            console.log('error')
            return;
        }

        server.getInfo(function(error,serverInfo) {
            if (error) {
                console.log('error')
                return;
            }

            getPipelinesInfo(server, function( pipelinesInfo ) {
                 //add pipeline info to server info
                serverInfo.pipelines = pipelinesInfo;
                console.log(JSON.stringify(serverInfo));
                _kurentoClient.close();
                process.exit();
            })
        })
    })
});
