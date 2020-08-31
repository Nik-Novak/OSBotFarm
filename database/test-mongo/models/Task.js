const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TaskSchema = new Schema(
  {
    name: String,
    description: String
  }
);

const Task = mongoose.model('task', TaskSchema); //any time Account is created, it will be in the 'account' colllection and based on AccountSchema

module.exports = { Task, TaskSchema };