const path = require('path');
const fs = require('fs');

let config;

let operationHandler = function(req, res){
  console.log('Executing Operation: ' + path.relative(process.cwd(),__filename));
  res.status(501)
  res.send();
}

module.exports = function(cfg){
  config = cfg;
  return operationHandler
}