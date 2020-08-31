const assert = require('assert');
const { Account } = require('../models/Account');

describe('Saving records', function(){
  //create tests
  it('Saves record to the data base', function(done){
    let account = new Account({
      username: 'username123',
      password: 'password123'
    });
    account.save()
      .then(()=>{
        assert(account.isNew === false); // model.isNew returns false if its not been saved to satabase
        done();
      });
  });

});