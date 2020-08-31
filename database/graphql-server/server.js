//@ts-check
const express = require('express');
const graphqlHTTP = require('express-graphql');
// const schema = require('./schema/schema');
const config = require('config');
const models = require('models');
const schema = require('./schemas/schema');

const cors = require('cors');

const server = express();
//test
// set mongoose internal promises
models.Promise = global.Promise;

// connect to DB before tests run
models.connect( config.get('db'), 
  { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false }
);

models.connection
  .once('open', function(){
    console.log('Connected to DB');
    serverSetup(server);
  })
  .on('error',function(err){
    console.log('Failed to connect to DB: ');
    console.error(err);
  });
  

function serverSetup(server){
  // ######## middleware #########
  server.use(cors());
  // ######## endpoints ##########
  server.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true
  }));




  let httpServer = server.listen(config.get('port'), ()=>{
    console.log(`Server up ${config.get('host')}:${config.get('port')}`);
  });

  async function gracefulTermination(){
    console.log('An exit signal was caught, shutting down gracefully.');
    await httpServer.close();
    console.log('Server finished serving requests and has been terminated.');
    await models.disconnect();
    console.log('Database connection has been closed.')
  }
  
  process.once('exit', gracefulTermination);
  process.once('SIGINT', gracefulTermination);
  process.once('SIGTERM', gracefulTermination);
  process.once('SIGUSR2', gracefulTermination); //nodemon's restart signal
}