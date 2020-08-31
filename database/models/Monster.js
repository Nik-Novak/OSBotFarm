//@ts-check
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { Integer, ExistingID, Icon } = require('./_shared/schemas');

const options = {discriminatorKey: '_type'};

const MonsterSchema = new Schema(
  {
    monsterID:         { ...Integer.Positive, required:true },
    name:           { type:String, required:true },
    examine:        String,
    size:            { type: Integer.Positive, required: true },
    category:       {  }
    incomplete:     { type:Boolean, required:true },
    members:        { type:Boolean, required:true },
    release_date: Date,
    duplicate:      { type:Boolean, required:true },
    wiki_name:      String,
    wiki_url:       String,
    icon:           Icon
  }, options
);
MonsterSchema.index({monsterID: 1}, {unique: true});
MonsterSchema.index({monsterID: 1, name:1}, {unique: true});

const Monster = mongoose.model('Monster', MonsterSchema);

module.exports = { Monster }