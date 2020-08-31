//@ts-check
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process')

let config;


function success(req, res, health){
  console.log('SUCCESS')
  // console.log('lod:', req.query.lod)
  // console.log('health:', health)
  res.setHeader('Content-Type', 'application/json');
  if(!req.query.lod)
    res.status(200).send();
  else
    res.status(200).send(health);
}

function fail(req, res, health){
  console.log('FAILURE')
  console.log('lod:', req.query.lod)
  console.log('health:', health)
  res.setHeader('Content-Type', 'application/json');
  if(!req.query.lod)
    res.status(503).send();
  else{
    res.status(503).send(health);
  }
}

let operationHandler = function(req, res){
  console.log('Executing Operation: ' + path.relative(process.cwd(),__filename));
  
  let health={}
  let failure=false;

  try{
    let api_version=config.get('version');
    health['api_version'] = api_version;
    if(!api_version)
      throw Error('API version was empty or null.')
  }catch(err){
    health['api_version'] = {
      code:err.code || -1,
      message: 'Failed to fetch API version.',
      error: err.message,
      path: 'checkHealth'
    }
    failure=true;
  }

  try{
    let java_version= execSync('echo $(java -version 2>&1)').toString();
    health['java_version'] = java_version;
    if(!java_version)
      throw Error('Java version was empty or null.')
  }catch(err){
    health['java_version'] = {
      code:err.code || -1,
      message: 'Failed to fetch Java version.',
      error: err.message,
      path: 'checkHealth'
    }
    failure=true;
  }

  try{
    let client_lastmodified = execSync("stat -c '%Y' $DBHOME/BotData/client.jar").toString().trim();
    health['client_lastmodified'] = new Date(parseInt(client_lastmodified)*1000).toISOString();
    if(!client_lastmodified)
      throw Error('client lastmodified timestamp was empty or null.')
  }catch(err){
    health['client_lastmodified'] = {
      code:err.code || -1,
      message:  'Failed to fetch Client lastmodified timestamp.',
      error: err.message,
      path: 'checkHealth'
    }
    failure=true;
  }

  if(failure){
    fail(req, res, health);
    return;
  }

  success(req, res, health);
}

module.exports = function(cfg){
  config = cfg;
  return operationHandler
}