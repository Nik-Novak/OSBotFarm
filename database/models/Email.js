//@ts-check
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { Integer } = require('./_shared/schemas')
const EmailSchema = new Schema(
  {
    username: { type:String, required:true },
    domain: { type:String, required:true },
    accessible: { type:Boolean, required:true }
  }
);

EmailSchema.index({username: 1, domain: 1}, {unique: true});

const Email = mongoose.model('Email', EmailSchema);

module.exports = { Email };