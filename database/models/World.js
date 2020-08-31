//@ts-check
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { Integer, ExistingID } = require('./_shared/schemas');

const { Requirement } = require('./Requirement')

const WorldSchema = new Schema(
  {
    world: { ...Integer.Positive, required:true },
    location: { type:String, enum:['us', 'us', 'uk','de', 'au'], required:true },
    members: { type:Boolean, required:true },
    kind: {type:String, enum:['regular', 'pvp', 'dmm', 'twisted_league', 'beta'], required:true },
    activity: String,
    requirementIDs: {type:[ExistingID(Requirement)], default:[]}
  }
);

WorldSchema.index({world: 1}, {unique: true});

const World = mongoose.model('World', WorldSchema);

module.exports = { World }