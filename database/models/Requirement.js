//@ts-check
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { Task } = require('./Task');
const { LevelMap } = require('./LevelMap');
// const { Quest } = require('./Quest');
// const { Item } = require('./Item');
const { ExistingID, Integer, Skill } = require('./_shared/schemas');

const options = {discriminatorKey: '_type'};

const RequirementSchema = new Schema(
  {
    name: {type:String, required: true},
    description: {type: String, required: true},
    taskIDs: { type:[ExistingID(Task)], default: [] },
    requirementIDs: {
      // @ts-ignore 
      type: mongoose.ObjectId,
      validate:{
        validator: value => Requirement.findById(value),
        message: `{VALUE} must match the ID of an existing Requirement in the database.`
      }
    }
  }, options
);
RequirementSchema.index({name: 1, _type: 1}, {unique: true});

const Requirement = mongoose.model('Requirement', RequirementSchema);

// ############ SkillRequirement extends Requirement #############
const SkillRequirementSchema = new Schema(
  {
    skill: { ...Skill, required:true },
    target_xp: { ...Integer, required:true }
  }, options
);
SkillRequirementSchema.index({ skill:1, target_xp:1 }, {unique:true})

// SkillRequirementSchema['evaluator'] = function(a,b){return a+b};
const SkillRequirement = Requirement.discriminator('SkillRequirement', SkillRequirementSchema);

// ############ TotalRequirementSchema extends Requirement #############
const TotalRequirementSchema = new Schema(
  {
    total_of: { type:String, enum:['level', 'questpoints', 'xp'], required:true },
    target: { ...Integer, required:true }
  }, options
);
TotalRequirementSchema.index({ total_of:1, target:1 }, {unique:true})

const TotalRequirement = Requirement.discriminator('TotalRequirement', TotalRequirementSchema);

// ############ CombatRequirement extends Requirement #############
const CombatRequirementSchema = new Schema(
  {
    target: { ...Integer, required:true } //level
  }, options
);
CombatRequirementSchema.index({ target:1 }, {unique:true})

const CombatRequirement = Requirement.discriminator('CombatRequirement', CombatRequirementSchema);

// ############ QuestRequirement extends Requirement#############
// const QuestRequirementSchema = new Schema(
//   {
//     questID: { ...ExistingIDSchema(Quest), required: true },
//   }
// );
// const QuestRequirement = Requirement.discriminator('QuestRequirement', QuestRequirementSchema);

// ############ QuestRequirement extends Requirement#############
// const ItemRequirementSchema = new Schema(
//   {
//     questID: { ...ExistingIDSchema(Item), required: true },
//   }
// );
// const ItemRequirement = Requirement.discriminator('ItemRequirement', ItemRequirementSchema);

module.exports = { Requirement, SkillRequirement, TotalRequirement, CombatRequirement /* QuestRequirement, ItemRequirement */}