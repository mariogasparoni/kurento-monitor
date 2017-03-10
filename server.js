/**
* kurento-monitor (c) 2016-2017 Mario Gasparoni Junior
*
* Freely distributed under the MIT license
*/

const config = require('config');
const kurento = require('kurento-client');
const fs = require('fs');
const file_output = config.get('file_output');

const logger_file_writer = getFileWriter();

const logger_options = {
  pattern: "dd-mm HH:MM:ss",
  label: false,
  stdout: logger_file_writer
};

const console_stamp_options = {
  pattern: "dd-mm HH:MM:ss",
  label: false
};

var logger = new console.Console(logger_file_writer,logger_file_writer);

const console_stamp = require('console-stamp');
console_stamp(logger,logger_options);
console_stamp(console,console_stamp_options);

const spacesNum = config.get('space_width');

const info_interval = config.get('info_interval') || 2000;
const keep_monitoring = config.get('keep_monitoring');
const pipelines_only = config.get('pipelines_only');

process.env.NODE_TLS_REJECT_UNAUTHORIZED =
  config.get('kurento.reject_self_signed');

var kurentoClient = null;

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

function output(data) {
  console.log(data);
  if (file_output) {
    logger.log(data);
  }
}

function showInfo(server) {
  if (!server) {
    return;
  }

  server.getInfo(function(error,serverInfo) {
    if (error) {
      console.log(error);
      exit(1);
    }

    getPipelinesInfo(server, function( pipelinesInfo ) {
      var pipelinesNumber = Object.keys(pipelinesInfo).length;
      if (pipelines_only) {
        output(pipelinesNumber);
      } else {
        //add pipeline info to server info
        serverInfo.pipelinesNumber = pipelinesNumber;
        serverInfo.pipelines = pipelinesInfo;
        output(JSON.stringify(serverInfo,null,spacesNum));
      }
    })
  })
}

function exit (code) {
  process.exit(code);
}

function getFileWriter() {
    var date = new Date();
    var year = date.getFullYear();
    var day = (date.getDate() < 10) ? '0' + date.getDate() : date.getDate() ;
    var month = (date.getMonth() < 10) ?
      '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
    var hours = (date.getHours() < 10) ? '0' + date.getHours() : date.getHours();
    var minutes = (date.getMinutes() < 10) ?
      '0' + date.getMinutes() : date.getMinutes();

    var dateFormat = ''+ year + day +  month + hours + minutes;

    return fs.createWriteStream('./kurento-monitor-' +
      dateFormat + '.out');
}

function stop (error) {
  if (kurentoClient) {
    kurentoClient.close();
  }

  if (file_output && logger_file_writer) {
    logger_file_writer.end();
  }
  exit(0);
}

process.on('SIGINT', stop);

function start () {
  getKurentoClient(function(err, _kurentoClient) {
    if (err) {
      console.log('Failed load kurento client. ' + err);
      exit(1);
    }

    kurentoClient = _kurentoClient;

    _kurentoClient.getServerManager(function (error,server) {
      if (error) {
        console.log(error);
        exit(1);
      }

      showInfo(server);
      if (keep_monitoring) {
        setInterval(showInfo, info_interval, server);
      }
    })
  });
}

//start
start();
