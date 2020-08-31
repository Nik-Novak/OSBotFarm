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
  if(!req || !res) //if null request or response exit
    return;
  res.status(200);
  res.send();
}

function existing(req, res){
  console.log('EXISTING')
  if(!req || !res) //if null request or response exit
    return;
  res.status(304);
  res.send();
}

function fail(req, res){
  console.log('FAILURE')
  if(!req || !res) //if null request or response exit
    return;
  res.status(500);
  res.send();
}

//helper functions

const isProcessRunning = require('./shared-functions/isProcessRunning.js');

function killProcesses(pids, force){
  if(Array.isArray(pids))
    pids.forEach(pid=>{
      console.log('KILL: ' + `kill -${force?'9':'15'} ${pid}`)
      let result = execSync(`kill -${force?'9':'15'} ${pid}`);  //SIGKILL=9, SIGTERM=15
      console.log('HERE')
    });
  return pids;
}

let operationHandler = function(req, res){
  console.log('Executing Operation: ' + path.relative(process.cwd(),__filename));

  console.log('Checking if Java is already running...')
  let pids = isProcessRunning('java');
  if(pids){
    console.log('Java was already running. Proceeding to shut it down.');
    console.log('Java Proceses found: ', pids);
    let force= req && req.query && req.query.force; //null check all parameters, since we can support null request and resolve
    if(killProcesses(pids, force)){
      success(req, res);
      return;
    }
  }
  else{
    console.log('Java was not found to be running. No action taken.');
    existing(req, res);
    return;
  }
  console.log('Not sure how we got here, congrats.')
  fail(req, res);
}

module.exports = function(cfg){
  config = cfg;
  return operationHandler
}