//@ts-check
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { ExistingID } = require('./_shared/schemas');
// const { Requirement } = require('./Requirement');
// const { Account } = require('./Account');

const TaskSchema = new Schema(
  {
    name: { type:String, required:true },
    description: { type:String, required:true },
    requirementIDs: { type:[ExistingID('requirements')], default:[] },
    recommendedIDs: { type:[ExistingID('requirements')], default:[] }
  }
);

TaskSchema.index({name:1}, {unique:true});

const Task = mongoose.model('Task', TaskSchema); //any time Account is created, it will be in the 'account' colllection and based on AccountSchema

module.exports = { Task };