const assert = require('assert');
const { Account } = require('../models/Account');

describe('Finding records', function(){

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

  //create tests
  it('Finds one record by name from the database', function(done){
    Account.findOne({username: "username123"})
      .then(function(result){
        assert(result.username === account.username);
        done();
      })
  });

  it('Finds one record by ID from the database', function(done){
    Account.findOne({_id: account._id})
      .then(function(result){
        assert(result._id.toString() === account._id.toString()); //careful comparing objcts
        done();
      })
  });

});