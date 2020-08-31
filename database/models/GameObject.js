//@ts-check
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { Integer, ExistingID, GameclientID, ExistingCustomID, PositionSchema, StatsSchema, ReportingSchema} = require('./_shared/schemas')
const { Account } = require('./Account');
const { Item } = require('./Item');
const { Requirement } = require('./Requirement');

const options = {discriminatorKey: '_type'};

// ###### GameObject ######
const GameObjectSchema = new Schema(
  {
    gameID:           { ...Integer.Positive, required:true },
    name:             { type:String, required:true },
    interactions:     { type:[String], required:true },
    reporting:          ReportingSchema,
    examine:          String
  }
);

GameObjectSchema.index({ gameID: 1 }, {unique: true});

const GameObject = mongoose.model('GameObject', GameObjectSchema);

// ###### Resource ######
const OutputSchema = {
  items:  [ExistingID(Item)],
  xp:     { ...StatsSchema },
}
const ResourceSchema = new Schema(
  {
    inputs:           { type: [ExistingID(Item)], default:[] }, //consumeable only
    outputs:          { type:[OutputSchema], default:[] },
    requirementIDs:   [ExistingID(Requirement)]
  }, options
);

const Resource = GameObject.discriminator('Resource', ResourceSchema);

module.exports = { GameObject, Resource }