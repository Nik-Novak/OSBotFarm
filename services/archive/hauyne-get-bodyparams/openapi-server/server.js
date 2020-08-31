'use strict';
const { execSync } = require('child_process');
const server = require('./modules/OpenApiServer'); //custom OpenApi Server Module
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const mustacheExpress  = require('mustache-express');

const config = require('config');

//templating setup
server.engine('html', mustacheExpress());
server.set('view engine', 'html');
server.set('views', __dirname + '/views');

let operationsList = config.get('operationsList');

//TEMP helper for batch-creating missing operation files
let template = fs.readFileSync('./resources/templates/operation.js', 'utf8');
operationsList.forEach(operation=>{
  let filepath = `./operations/${operation}.js`;
  if(!fs.existsSync(filepath))
    fs.writeFileSync(`./operations/${operation}.js`, template, 'utf8');
});
//end TEMP

// map defined operations to their respective .js file handlers
let operations = {};
operationsList.forEach(operation=>{
  let filePath = `${config.get('operationsBasePath')}/${operation}.js`;
  operations[operation] = require(filePath)(config); //converts to object property: operation: require('operationsBase/operation.js')
});

server.init(
  {
      apiDoc: config.get('apiDoc'),
      vendorExtensions: {},
      responseValidation: 'strict', //'strict', 'warn'
      operations:
      {
        //EXAMPLE
        listPets: function(req, res){
          console.log('Serverside listPets');
          res.status(200);
          res.send([{id:123, name: 'hard-coded pet'}, {id:234, name: 'another hc pet'}]);
        },
        createPets: function(req, res){
          console.log('Serverside listPets');
          res.status(201)
          res.send();
        },
        //END EXAMPLE
        ...operations //assign all operations that were generated here, to be executed upon appropriate request
      },
      middleware:[
        function(req, res, next){ //global headers

          //Grant full access to requests coming from localhost
          // let fullHost;
          // if( req.ip=='::1' || req.ip=='127.0.0.1' || ( //if ip is straight from localhost
          //       req.headers.origin && req.headers.origin.match(/http:\/\/localhost:[0-9]{1,5}/gm) //or the origin ip is localhost
          //     )
          //   )
          //   fullHost = req.headers.origin || req.protocol+'://'+req.hostname+(config.get('port')!=80?`:${config.get('port')}`:'') //compute origin url
          res.set('Access-Control-Allow-Origin', ['*']); //TODO reimplement cors //allow origin url if local 
          res.set('Access-Control-Allow-Methods', ['GET','PUT','POST','DELETE']);
          res.set('Access-Control-Allow-Headers', 'content-type');
          res.set('Access-Control-Expose-Headers', 'content-type');

          //Ensure absolutely no cacheing
          res.set('Cache-Control', ['no-cache', 'no-store', 'must-revalidate']);
          res.set('Pragma', 'no-cache');
          res.set('Expires', '0');
          next();
        },
      ],
      consumesMiddleware:{
        '*/*': function(req, res, next){
          console.log("TESTING ALL REQBODIES MW");
          next()
        },
        'application/json': bodyParser.json(),
        'text/text': bodyParser.text()
      },
      errorTransformer: function(openapiError, ajvError) {
        return {
            code: -1,
            error: openapiError.errorCode,
            message: openapiError.message,
            path: openapiError.path,
            location: openapiError.location
          };
      }
    }
);

console.log(`Server running: http://${config.get('host')}:${config.get('port')}`);

let httpServer = server.listen(config.get('port'), function(){
  if(process.env.SYSTEM_STATUS_DIR) //show api_server readiness for readiness checks
    fs.writeFileSync(`${process.env.SYSTEM_STATUS_DIR}/READY_APISERVER`, "");
});

function gracefulTermination(){
  console.log('An exit signal was caught, shutting down gracefully.');
  httpServer.close(function(){ //finish serving requests then callback
    //do stuff
  });
}

process.on('exit', gracefulTermination);
process.on('SIGINT', gracefulTermination);
process.on('SIGTERM', gracefulTermination);
// process.on('SIGTERM', gracefulTermination);