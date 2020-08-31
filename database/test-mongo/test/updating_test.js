const assert = require('assert');
const { Account } = require('../models/Account');

describe('Updating records', function(){

  let account;

  beforeEach(function(done){
      account = new Account({
      username: 'username123',
      password: 'password123',
      level: 23
    });
    account.save()
      .then(()=>{
        done();
      });
  });

  it('Updates one record in the database', function(done){
    Account.findOneAndUpdate({username: account.username}, {username: 'newusername123'})
      .then((updateResult)=>{
        Account.findById(account._id)
          .then((result)=>{
            assert(result.username === 'newusername123');
            assert(result._id.toString() == account._id.toString());
            done();
          });
      });
  });

  it('Increments level by one', function(done){
    Account.update({}, { $inc: { level: 1 } })
      .then(()=>{
        Account.findById(account._id)
          .then(result=>{
            assert(result.level === account.level+1);
            done();
          })
      })
  });
});