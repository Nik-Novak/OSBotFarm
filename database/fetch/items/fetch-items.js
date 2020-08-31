//@ts-check
const fs = require('fs');
const path = require('path');
const  https = require('https');
const { chain }  = require('stream-chain');
const StreamObject = require('stream-json/streamers/StreamObject');
const Async = require('async')
const models = require('models');

const {levelToExp} = require('./_shared/functions');
const {LevelMap} = require('models/LevelMap');
// const {Task} = require('models/Task');

const {createItem, createRequirements} = require('./create-db-documents');

function connectToDB(db){
  return new Promise(function(resolve,reject){
    models.connect(db, 
      { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }
    );
    models.connection.once('open', (conn)=>{
      console.log('Connected to DB.');
      // Task.find({}).then(data=>console.log(data));
      // let task = new Task({name:'test', description:'test'})
      // task.save().then(record=>console.log(record))
      resolve(models.connection);
    });
    models.connection.on('error', (err)=>{
      console.log('Error in DB connection.');
      reject(err);
    });
  });
}

async function writeToOutputFile(res, filepath){   //write to output file as a backup
  let output = fs.createWriteStream(filepath);
  res.pipe(output);
  res.on('end', ()=>{
    console.log(`Successfully written out to ${filepath}`);
  });
}

let counter=0;

async function processData( {data, options} ){
  let currentItemID = data.value.id;
try{

  // if(counter>23400)
  //   await new Promise((resolve,reject)=>setTimeout(resolve,500))
  counter++;
  console.log(counter)
  if(options.database){ //if database is provided, save items and their requirements to it
    let itemRequirements = await createRequirements(data.value);//get list of IDs of existing requirements, as well as documents of newly created ones
    let itemRequirementIDs = await Promise.all(itemRequirements.map(async itemreq => { //save any newly created ones and replace their document with the new ID in the list
      // @ts-ignore
        if(models.Types.ObjectId.isValid(itemreq))
          return itemreq; //already an ID so just return it
          // @ts-ignore
        return  (await itemreq.save())._id; //save document and return its ID
      }));
    let item = await createItem(data.value, itemRequirementIDs);
    await item.save();
    
  }
}catch(err){console.log('ERROR on itemID:',currentItemID, err)}
}

function streamHandler(res, options){
  return new Promise((resolve, reject)=>{
    let dataQueue = Async.queue(processData);
    writeToOutputFile(res, options.outputFilePath);

    let pipeline = res.pipe(StreamObject.withParser());
    pipeline.on('data', data => {dataQueue.push( {data, options} )});

    pipeline.on('end', ()=>{
      if(dataQueue.length)
        dataQueue.drain(()=>{
          console.log(`dataQueue complete, ${counter} items were found.`)
          resolve();
        });
        else{
          console.log(`stream complete and dataqueue empty, ${counter} items were found.`)
          resolve();
        }
    });
    
  });
  
}

async function fetch(options){
  //connect to db
  let connection;
  if(options.database)
    connection = await connectToDB(options.database);

  //check if the uri given is a filepath, and if so open a readstream
  // let filepath = options.cwd ? path.join(options.cwd, options.url) : options.url
  // options.outputFilePath = options.cwd ? path.join(options.cwd,options.outputFilePath) : options.outputFilePath
  if(fs.existsSync(options.url)){ //if uri is a filepath, create a readstream from it
    let stream = fs.createReadStream(options.url);
    await streamHandler(stream, options)
    if(connection)
      connection.close();
  }
  else //uri was not a filepath, get data from external source
    https.get(options.url, async function(res){
      await streamHandler(res, options);
      if(connection)
        connection.close();
    });
}

module.exports = { fetch }