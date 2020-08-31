//@ts-check
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { Integer } = require('./_shared/schemas')

const LevelMapSchema = new Schema(
  {
    level: Integer,
    exp: Integer,
    expNext: Integer
  }
);

LevelMapSchema.index({level: 1}, {unique: true});
LevelMapSchema.index({exp: 1});

const LevelMap = mongoose.model('LevelMap', LevelMapSchema);

module.exports = { LevelMap }