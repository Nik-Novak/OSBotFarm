//@ts-check
const { transpileSchema } = require('graphql-s2s').graphqls2s;
const { Requirement, SkillRequirement, TotalRequirement, CombatRequirement, QuestRequirement } = require('models/Requirement');
const { getDocument,getDocuments,updateDocument,updateDocuments,deleteDocument,deleteDocuments } = require('./_shared/operations');
const { Task } = require('models/Task');
const { LevelMap } = require('models/LevelMap');
const { levelToExp, expToLevel, renameProperties } = require('./_shared/functions');
const { TLQueryOperators } = require('./_shared/transpileable-schemas');
module.exports.typeDef = transpileSchema(`

  ${TLQueryOperators}

  enum RequirementType {
    Requirement, SkillRequirement, TotalRequirement, CombatRequirement, QuestRequirement
  }

  enum TotalRequirementType {
    level, xp, questpoints
  }

  enum TargetFormat {
    xp, level
  }

  interface Requirement {
    id:ID!
    type: RequirementType
    name: String!
    description: String!
    tasks: [Task]!
    requirements: [Requirement]!
  }
  input RequirementInput {
    name: String!
    description: String!
    taskIDs: [ID]
    requirementIDs: [ID]
  }
  input RequirementFilter {
    id:ID
    type: RequirementType
    name: String
    description: String
  }

  ########## SKILL REQUIREMENT ##########
  type SkillRequirement inherits Requirement implements Requirement {
    skill:Skill!
    target( format:TargetFormat! ):Int!
  }
  input SkillRequirementInput inherits RequirementInput {
    skill:Skill!
    target_xp:Int!
  }
  input SkillRequirementFilter inherits RequirementFilter {
    skill:Skill
    target_xp:Int
  }

  ########## TOTAL REQUIREMENT ##########
  type TotalRequirement inherits Requirement implements Requirement {
    total_of:TotalRequirementType!
    target:Int!
  }
  input TotalRequirementInput inherits RequirementInput {
    total_of:TotalRequirementType!
    target:Int!
  }
  input TotalRequirementFilter inherits RequirementFilter {
    total_of:TotalRequirementType
    target:Int
  }

  ########## COMBAT REQUIREMENT ##########
  type CombatRequirement inherits Requirement implements Requirement {
    target:Int!
  }
  input CombatRequirementInput inherits RequirementInput {
    target:Int!
  }
  input CombatRequirementFilter inherits RequirementFilter {
    target:Int
  }

  ########## QUEST REQUIREMENT ##########
  type QuestRequirement inherits Requirement implements Requirement {
    questID: ID!
  }
  input QuestRequirementInput inherits RequirementInput {
    questID: ID!
  }
  input QuestRequirementFilter inherits RequirementFilter {
    questID: ID
  }

  input RequirementFilterUnion inherits TLQueryOperators<RequirementFilterUnion>,SkillRequirementFilter,TotalRequirementFilter,CombatRequirementFilter,QuestRequirementFilter {
  }

  #### Root ####

  extend type Query {
    requirement( filter:RequirementFilterUnion, random:Boolean ): Requirement
    requirements( filter:RequirementFilterUnion, random:Boolean, limit:Int ): [Requirement]
  }

  extend type Mutation {
    addSkillRequirement( skill_requirement:SkillRequirementInput! ): SkillRequirement
    addSkillRequirements( skill_requirement:[SkillRequirementInput]! ): [SkillRequirement]
    addTotalRequirement( total_requirement:TotalRequirementInput! ): TotalRequirement
    addTotalRequirements( total_requirement:[TotalRequirementInput]! ): [TotalRequirement]
    addCombatRequirement( combat_requirement:CombatRequirementInput! ): CombatRequirement
    addCombatRequirements( combat_requirement:[CombatRequirementInput]! ): [CombatRequirement]
    addQuestRequirement( quest_requirement:QuestRequirementInput! ): QuestRequirement
    addQuestRequirements( quest_requirement:[QuestRequirementInput]! ): [QuestRequirement]
    updateRequirement( filter:RequirementFilterUnion!, update:RequirementFilterUnion! ): Requirement #TODO Report weird discovered GraphQL bug where comma is required here, but on in accounts update. Might have to do with schema transpile. 
    updateRequirements( filter:RequirementFilterUnion!, update:RequirementFilterUnion! ): [Requirement]
    delRequirement( filter:RequirementFilterUnion! ): Requirement
    delRequirements( filter:RequirementFilterUnion! ): [Requirement]
  }
`);
module.exports.resolvers = {

  Requirement: {
    __resolveType(obj, context, info){
      return obj._type
    },
    type: requirement=>(requirement._type),
    tasks: requirement => {return Task.find({
      _id: {$in: requirement.taskIDs}
    })},
    requirements: (requirement, args) => {return Requirement.find({
      _id: {$in: requirement.requirementIDs }
    })}
  },
  get SkillRequirement(){ //must be this way to reference above requirement inheritor
    return (
      {
        ...this.Requirement, //inherits from requirement
        //custom skill resolvers
        target: (skillrequirement, args)=>{
          if(args.format == 'xp')
            return skillrequirement.target_xp;
          if(args.format == 'level')
            return expToLevel(skillrequirement.target_xp, LevelMap);
        }
      }
    )
  },

  // ### Root ###
  Query:{
    requirement: getDocument(Requirement),
    requirements: getDocuments(Requirement)
  },
  Mutation: {
    
    // add SkillRequirements
    addSkillRequirement: (parent, args) => {
      let skillRequirement = new SkillRequirement(args.skill_requirement);
      return skillRequirement.save();
    },
    addSkillRequirements: (parent, args) => SkillRequirement.insertMany(args.skill_requirements),
    // add TotalRequirements
    addTotalRequirement: (parent, args) => {
      let totalRequirement = new TotalRequirement(args.total_requirement);
      return totalRequirement.save();
    },
    addTotalRequirements: (parent, args) => TotalRequirement.insertMany(args.total_requirements),
    // add CombatRequirements
    addCombatRequirement: (parent, args) => {
      let combatRequirement = new CombatRequirement(args.combat_requirement);
      return combatRequirement.save();
    },
    addCombatRequirements: (parent, args) => CombatRequirement.insertMany(args.combat_requirements),
    // add QuestRequirements
    addQuestRequirement: (parent, args) => {
      let questRequirement = new QuestRequirement(args.quest_requirement);
      return questRequirement.save();
    },
    addQuestRequirements: (parent, args) => QuestRequirement.insertMany(args.quest_requirements),

    // generic resolvers
    updateRequirement: updateDocument(Requirement),
    updateRequirements: updateDocuments(Requirement),
    delRequirement: deleteDocument(Requirement),
    delRequirements: deleteDocuments(Requirement),
  }
}