const express = require('express');
const mongoose = require('mongoose');

const server = express();

mongoose.connect('mongodb://localhost:27017/test');

mongoose.connection
  .once('open', function(){
    console.log('Connected to DB');
  })
  .on('error',function(err){
    console.error(err);
  });

// server.listen(8000, ()=>{
//   console.log('Server up localhost:8000');
// });