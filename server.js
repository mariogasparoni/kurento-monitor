/**
* kurento-monitor (c) 2016-2017 Mario Gasparoni Junior
*
* Freely distributed under the MIT license
*/

const config = require('config');
const kurento = require('kurento-client');

const spacesNum = config.get('space_width');

process.env.NODE_TLS_REJECT_UNAUTHORIZED =
  config.get('kurento.reject_self_signed');

function getKurentoClient(callback) {
  var wsUri = process.argv[2] || config.get('kurento.server.uri');

  kurento(wsUri, function(err, _kurentoClient) {
    if (err) {
      console.log("Could not find media server at address " + wsUri);
      return callback(err);
    }

    callback(null, _kurentoClient);
  });
}

function getPipelinesInfo(server, callback) {
  if (!server) {
    return callback({});
  }

  var _pipelines = {};

  server.getPipelines(function(error,pipelines){
    if (error || (pipelines && pipelines.length < 1)) {
      return callback({});
    }

    var childsCounter = 0;
    pipelines.forEach(function(p,index,array){
      p.getChilds(function(error,elements){
        //add child elements to pipeline
        this.childs = elements;
        //append pipeline+childs to _pipelines
        _pipelines[childsCounter] = this
        childsCounter++;
        if(childsCounter == array.length) {
          //last child got, return
          return callback(_pipelines||{});
        }
      })
    })
  })
}

function exit (code) {
  process.exit(code);
}

getKurentoClient(function(err, _kurentoClient) {
  if (err) {
    console.log('Failed load kurento client. ' + err);
    exit(1);
  }

  _kurentoClient.getServerManager(function (error,server) {
    if (error) {
      console.log(error);
      exit(1);
    }

    server.getInfo(function(error,serverInfo) {
      if (error) {
        console.log(error);
        exit(1);
      }

      getPipelinesInfo(server, function( pipelinesInfo ) {
        //add pipeline info to server info
        serverInfo.pipelinesNumber = Object.keys(pipelinesInfo).length;
        serverInfo.pipelines = pipelinesInfo;
        console.log(JSON.stringify(serverInfo,null,spacesNum));
        _kurentoClient.close();
        exit(0);
      })
    })
  })
});
