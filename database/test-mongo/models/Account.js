const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { TaskSchema } = require('./Task')

const AccountSchema = new Schema(
  {
    username: String,
    password: String,
    level: Number,
    tasks: [TaskSchema]
  }
);

const Account = mongoose.model('account', AccountSchema); //any time Account is created, it will be in the 'account' colllection and based on AccountSchema

module.exports = { Account, AccountSchema }