//@ts-check
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process')

let config;


function success(req, res, readiness){
  console.log('SUCCESS')
  if(!req.query.lod)
    res.status(200).send();
  else
    res.status(200).send(readiness);
}

function fail(req, res, msg, readiness){
  console.log('FAILURE')
  console.log('lod:', req.query.lod)
  console.log('readiness:', readiness)
  if(!req.query.lod)
    res.status(503).send();
  else
    res.status(503).send(readiness);
}

let operationHandler = function(req, res){
  console.log('Executing Operation: ' + path.relative(process.cwd(),__filename));
  
  let readiness={}
  let failure=false;

  let SYSTEM_STATUS_DIR = process.env.SYSTEM_STATUS_DIR;

  try{
    if(fs.existsSync(`${SYSTEM_STATUS_DIR}/READY_UPDATES`))
      readiness['up_to_date']=true;
    else
      throw Error('System failed its up_to_date check')
  }catch(err){
    readiness['up_to_date'] = {
      code:err.code,
      message: 'System failed its up_to_date check',
      error: err.message,
      path: 'checkHealth'
    }
    failure=true;
  }

  try{
    if(fs.existsSync(`${SYSTEM_STATUS_DIR}/READY_SCRIPTS`))
      readiness['scripts_installed']=true;
    else
      throw Error('System failed its script_readiness check.')
  }catch(err){
    readiness['scripts_installed'] = {
      code:err.code,
      message: 'System failed its script readiness check.',
      error: err.message,
      path: 'checkHealth'
    }
    failure=true;
  }

  try{
    if(fs.existsSync(`${SYSTEM_STATUS_DIR}/READY_CLIENTRESOURCES`))
      readiness['clientresources_installed']=true;
    else
      throw Error('System failed its clientresources readiness check.')
  }catch(err){
    readiness['clientresources_installed'] = {
      code:err.code,
      message: 'System failed its clientresources readiness check.',
      error: err.message,
      path: 'checkHealth'
    }
    failure=true;
  }

  try{
    if(fs.existsSync(`${SYSTEM_STATUS_DIR}/READY_APISERVER`))
      readiness['apiserver_running']=true;
    else
      throw Error('System failed its apiserver readiness check.')
  }catch(err){
    readiness['apiserver_running'] = {
      code:err.code,
      message: 'System failed its apiserver readiness check.',
      error: err.message,
      path: 'checkHealth'
    }
    failure=true;
  }


  if(failure){
    fail(req, res, readiness);
    return;
  }

  success(req, res, readiness);
}

module.exports = function(cfg){
  config = cfg;
  return operationHandler
}