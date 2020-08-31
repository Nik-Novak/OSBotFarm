//@ts-check
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { ExistingIDSchema } = require('./_shared/schemas')
const { Requirement } = require('./Requirement');
const { Integer } = require('./_shared/schemas');

const QuestLengthSchema = {
  type: String,
  enum: ['Very short', 'Short', 'Medium', 'Long', 'Very long']
}

const QuestSchema = new Schema(
  {
    name: { type:String, required:true },
    description: { type:String, required:true },
    difficulty: { 
      type:String, 
      enum:['Novice', 'Intermediate', 'Experienced', 'Master', 'Grandmaster', 'Special'], 
      required:true 
    },
    lengths: { type: [QuestLengthSchema], required: true },
    questpoints: {...Integer.Positive, required:true },
    series: String,
    requirements: { type:[ExistingIDSchema(Requirement)], default:[] }, //quests, items, skills
    recommendeds: { type:[ExistingIDSchema(Requirement)], default:[] },
    rewards: { type:[ExistingIDSchema(Reward)], default:[] }
  }
);

QuestSchema.index({name: 1}, {unique: true});

const Quest = mongoose.model('Quest', QuestSchema);

module.exports = { Quest }