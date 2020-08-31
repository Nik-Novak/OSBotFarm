//@ts-check
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { Integer, ExistingID, GameclientID, ExistingCustomID, PositionSchema, StatsSchema, ReportingSchema } = require('./_shared/schemas')
const { Account } = require('./Account');
const { Item } = require('./Item');
const { Requirement } = require('./Requirement');
const { GameObject } = require('./GameObject');

const options = {discriminatorKey: '_type'};

// ###### GameObjectInstance ######
const AccessibilitySchema = {
  interactable_tiles:   { type:[ PositionSchema({required:{x:true, y:true, z:true}}) ], required:true },
  dangerous:        Boolean, //Set when using the spot in a script so that you capture the entire path to the object and back, do not set at reporting time.
}
const GameObjectInstanceSchema = new Schema({
  game_objectID:    { ...ExistingID(GameObject), required:true },
  position:         PositionSchema( { required:{x:true, y:true, z:true} } ),
  accessibility:    AccessibilitySchema,
  reporting: ReportingSchema
});

GameObjectInstanceSchema.index({ game_objectID: 1, 'position.x':1, 'position.y':1, 'position.z':1 }, {unique: true});

const GameObjectInstance = mongoose.model('GameObjectInstance', GameObjectInstanceSchema);

// ###### ResourceInstance ######
const ResourceInstanceSchema = new Schema(
  {
    
  }, options
);

ResourceInstanceSchema.index({accountID: 1}, {unique: true});

const ResourceInstance = GameObjectInstance.discriminator('ResourceInstance', ResourceInstanceSchema);

module.exports = { GameObjectInstance, ResourceInstance }