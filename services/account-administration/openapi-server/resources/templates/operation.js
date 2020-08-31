//@ts-check
const path = require('path');
const fs = require('fs');

let config;

function success(req, res){
  console.log('SUCCESS')
  // build response here
  res.status(200).send();
}

function fail(req, res){
  console.log('FAILURE')
  // build response here
  res.status(500).send();
}

let operationHandler = function(req, res){
  console.log('Executing Operation: ' + path.relative(process.cwd(),__filename));
  res.status(501)
  res.send();
}

module.exports = function(cfg){
  config = cfg;
  return operationHandler
}