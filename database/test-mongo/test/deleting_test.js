const assert = require('assert');
const { Account } = require('../models/Account');

describe('Deleting records', function(){

  let account;

  beforeEach(function(done){
      account = new Account({
      username: 'username123',
      password: 'password123'
    });
    account.save()
      .then(()=>{
        done();
      });
  });

  it('Deletes one record from database', function(done){
    Account.find
    Account.findOneAndDelete({username: account.username})
      .then((deletedResult)=>{
        Account.findOne({username: deletedResult.username})
        .then(function(result){
          assert(result === null);
          done();
        })
      });
  });

});