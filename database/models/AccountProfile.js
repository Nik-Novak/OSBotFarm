//@ts-check
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { Integer } = require('./_shared/schemas')

const BehaviourProfileSchema = {
  min_reaction: { type:Number, required:true },
  afk_amount: { type:Number, required:true },
  camera_movement: { type:Number, required:true },
}

const MouseProfileSchema = {
  mouse_hop: { Boolean,  required:true }, 
  hover_amount: { type:Number, required:true }, //TODO  make required
  multi_click_chance: { type:Number, required:true },
}

const AccountProfileSchema = new Schema({
  behaviour: { type:BehaviourProfileSchema, required:true },
  mouse: { type:MouseProfileSchema, required:true },
});

const AccountProfile = mongoose.model('AccountProfile', AccountProfileSchema);

module.exports = { AccountProfile }