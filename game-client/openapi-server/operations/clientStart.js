const path = require('path');
const fs = require('fs');
const { promisify } = require('util')
var spawn = require('child-process-promise').spawn;
var execSync = require('child_process').execSync;

let config;

let clientLaunchedTrip = 'Client is up to date and ready to launch!'

//events

function success(req, res){
  console.log('SUCCESS')
  res.status(200);
  res.send();
}
function existing(req, res){
  console.log('EXISTING');
  res.status(304);
  res.send();
}
function fail(req, res, msg){
  console.log('FAILURE')
  let errObj = {
    "code": 500,
    "error": `The client failed to start up fully. This could be due to server error, or because another source requested the client to be exited while starting up. Check logs for details. \nMessage: \t ${msg}`,
    "message": "Internal Server Error",
    "path": "/client/start"
  }
  res.status(500);
  res.send(errObj);
}

//helper functions

//convert JSON arrays and other parameter formats to deployable string format
function paramsToArgs(body){ //https://jsfiddle.net/L9e4qpcg/2/
  let cmdArgs = "";
  function valParse(key, value){
    if(Array.isArray(value)){ //special case for arrays
      if (Array.isArray(value[0])){ //if inner element is an array
        let tempStringbuilder = "";
        value.forEach(innerArray=>{
        	if(Array.isArray(innerArray))
        	  tempStringbuilder+=`${valParse('', innerArray)}`
          else
          	tempStringbuilder+=innerArray
        });
        return tempStringbuilder
      }
      value = value.map(arrVal=>valParse('',arrVal)); //send in sub values for parsing
      return Array.from(value).join(' ');
    }
    console.log(value, typeof value)
    return typeof(value)=='string'&&value.includes(' ') ? '"'+value+'"' : value;
  }
  Object.entries(body).forEach(([key, value])=>{
    cmdArgs+=`-${key} `
    cmdArgs+=`${valParse(key, value)} `
  });
  return cmdArgs;
}

const isProcessRunning = require('./shared-functions/isProcessRunning.js');

function launchClient(paramArgs){
  //console.debug('CLIENT BEING LAUNCHED as:', `java -jar ${process.env.DBHOME}/BotData/client.jar ${paramArgs}`)
  return new Promise((resolve, reject)=>{
    let fullClientPath = `${process.env.DBHOME}/BotData/client.jar`
    let argsAsArray = `-jar ${fullClientPath} ${paramArgs}`.split(' -');
    //console.debug('Args array: ', argsAsArray);
    var promise = spawn('java '+`-jar -Xbootclasspath/p:${fullClientPath} ${process.env.DBHOME}/BotData/client.jar ${paramArgs}`, null,{shell:true});
    
    let childProcess = promise.childProcess;
    childProcess.stdout.on('data', 
      function(data){
        let msg = data.toString();
        if (msg.includes('Successfully started new instance'))
          resolve(childProcess);
        if(msg)
          console.log('[SPAWN_OUT]', msg);
      }
    );
    childProcess.stderr.on('data', 
      function(data){
        if(data.includes('WARN')){
          console.log('[SPAWN_WARN]', data.toString());
        }
        else{
          if(data.toString().trim().length==0)
            return;
          console.log('[SPAWN_ERR]', data.toString());
          reject(data.toString());
        }
      }
    );
    promise
      .then(function(spawn){
        console.log('[SPAWN_COMPLETE] Closed.');
        reject('Process was closed before it had a chance to complete.');
      })
      .catch(function(err){
        console.log('[SPAWN_COMPLETE_ERROR] Error', err);
        reject(err);
      });

  });
}

let operationHandler = function(req, res){
  console.log('Executing Operation: ' + path.relative(process.cwd(),__filename));

  console.log('Checking if Java is already running...')
  if(isProcessRunning('java')){
    console.log('Java was already running. Not launching another instance.');
    existing(req,res);
    return;
  }
  console.log('Java was NOT already running.');

  console.log('Parsing parameters.')
  let paramArgs = paramsToArgs(req.body)
  console.log('Starting Jar with parameters:');
  console.log(paramArgs);
  console.log()
  
  console.log('Launching client');
  launchClient(paramArgs)
    .then(spawn=>{
      success(req, res);
      return;
    })
    .catch(err=>{
      fail(req, res, err)
    });
}

module.exports = function(cfg){
  config = cfg;
  return operationHandler
}