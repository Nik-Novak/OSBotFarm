const mongoose =require('mongoose');

// set mongoose internal promises
mongoose.Promise = global.Promise;

//connect to DB before tests run
before(function(done){
  mongoose.connect('mongodb://root:test123@localhost:27017/test?authSource=admin&w=1', 
    { useNewUrlParser: true, useUnifiedTopology: true }
  );

  mongoose.connection
    .once('open', function(){
      console.log('Connected to DB');
      done();
    })
    .on('error',function(err){
      console.log('Failed to connect to DB: ');
      console.error(err);
    });
});

// drop accounts collection before each test
beforeEach(function(done){
  mongoose.connection.collections.accounts.drop( ()=>done() );
});

//disconnect after tests run
after(function(done){
  mongoose.connection.close(function(){
    done();
  })
});
