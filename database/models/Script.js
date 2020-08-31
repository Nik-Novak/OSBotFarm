//@ts-check
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { Task } = require('./Task');
const { Requirement } = require('./Requirement');

const { Integer, ExistingID, StatsSchema } = require('./_shared/schemas');

const ProgressSchema = new Schema(
  {
    xp: { ...StatsSchema },
    gp: { ...Integer, default:0 }
  }
);

const ScriptMetadataSchema = new Schema(
  {
    theoreticalPPH: { type:ProgressSchema, required:true },
    calculatedPPH: ProgressSchema,
    global_runtime: Integer,
    global_progress: ProgressSchema
  }
);

const ScriptSchema = new Schema(
  {
    version: { type:String, required:true },
    name: { type:String, required:true },
    description: { type:String, required:true },
    metadata: { type:ScriptMetadataSchema, required:true },
    requirementIDs: { type:[ExistingID(Requirement)], default:[] },
    recomendedIDs: { type:[ExistingID(Requirement)], default:[] },
    taskIDs: [ExistingID(Task)]
  }
);

ScriptSchema.index({name: 1, version:-1}, {unique: true});
const Script = mongoose.model('Script', ScriptSchema);

module.exports = { Script };