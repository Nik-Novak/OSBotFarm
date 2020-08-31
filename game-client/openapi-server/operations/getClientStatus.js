//@ts-check
const path = require('path');
const fs = require('fs');

const isProcessRunning = require('./shared-functions/isProcessRunning');

let config;

function success(req,res, status){
  console.log('SUCCESS');
  res.set('Content-Type', 'application/json');
  res.status(200).send(status);
}

function fail(req, res, msg){
  console.log('FAILURE')
  let errObj = {
    "code": 500,
    "error": `The client failed to return a status for the following reason: \nReason: \t ${msg}`,
    "message": "Internal Server Error",
    "path": "/client/start"
  }
  res.status(500);
  res.send(errObj);
}

let operationHandler = function(req, res){
  console.log('Executing Operation: ' + path.relative(process.cwd(),__filename));
  try{
    let status = {
      version: 'v1',
      running: false,
    }
    if(isProcessRunning('java'))
      status.running=true
    success(req, res, status);
  } catch(err){ fail(req, res, err.message) }
}

module.exports = function(cfg){
  config = cfg;
  return operationHandler
}