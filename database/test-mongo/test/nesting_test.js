const assert = require('assert');
const mongoose = require('mongoose');
const { Account } = require('../models/Account');

describe('Nesting records', function(){

  beforeEach(function(done){
    mongoose.connection.collections.accounts.drop( () => done() )
  })

  it('Creates an account with sub-docments (tasks)', function(done){

    let account = new Account(
      {
        username: 'username123',
        password: 'password123',
        level: 23,
        tasks: [
          {
            name: 'money-making',
            description: 'make money'
          }
        ]
      }
    );

    account.save()
      .then(()=>{
        Account.findOne({username: account.username})
          .then(result=>{
            assert(result.tasks.length==1)
            done();
          })
      })
  })

  it('Adds a task to an account', function(done){
    let account = new Account(
      {
        username: 'username123',
        password: 'password123',
        level: 23,
        tasks: [
          {
            name: 'money-making',
            description: 'make money'
          }
        ]
      }
    );

    account.save()
      .then(()=>{
        Account.findById(account._id)
          .then(record => {
            //add task to tasks array
            record.tasks.push({name: 'woodcutting', description: 'trains wc skill'})
            record.save()
              .then(()=>{
                Account.findById(account._id)
                  .then(record => {
                    assert(record.tasks.length === 2)
                    done();
                  })
              })
          })
      });
  })


});