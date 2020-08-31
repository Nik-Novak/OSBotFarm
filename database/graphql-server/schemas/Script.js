
//@ts-check
const { transpileSchema }=require('graphql-s2s').graphqls2s;
const { renameProperties } = require('./_shared/functions')
const { Task } = require('models/Task');
const { Script } = require('models/Script');
const { Requirement } = require('models/Requirement');
const { TLQueryOperators } = require('./_shared/transpileable-schemas');
module.exports.typeDef = transpileSchema(`



type Progress {
  xp: Stats,
  gp: Int
}
input ProgressInput {
  xp: StatsInput,
  gp: Int
}

type ScriptMetadata {
  theoreticalPPH: Progress!,
  empiricalPPH: Progress,
  global_runtime: Int,
  global_progress: Progress
}

type Script {
  id: ID!
  version: String!
  name: String!
  description: String!
  metadata: ScriptMetadata!
  requirements: [Requirement]!
  recommendeds: [Requirement]!
  tasks: [Task]
}

#### Root ####

extend type Query {
  scripts: [Script]
  script( id:ID, version:String, name:String ):Script
}

extend type Mutation {
  addScript( version:String!, name:String!, description:String!, theoretical_progressPerHour:ProgressInput!, requirementIDs:[ID], recommendedIDs:[ID], taskIDs:[ID] ): Script
}
`);

module.exports.resolvers = {
  Script: {
    tasks: script => {
      return Task.find({
                _id: { $in: script.taskIDs }
              })
    },
    requirements: script => (Requirement.find({
      _id:{
        $in: script.requirementIDs
      }
    })),
    recommendeds: script => (Requirement.find({
      _id:{
        $in: script.recommendedIDs
      }
    }))
  },

  // ### Root ###
  Query:{
    scripts: (parent, args) => { return Script.find({}) },
    script: (parent, args) => { 
      let renamedArgs = renameProperties(['id', 'type'], ['_id', '_type'], args);
      return Script.findOne(renamedArgs);
     },
  },
  Mutation: {
    addScript: (parent, args) => {
      let script = new Script({
        version: args.version,
        name: args.name,
        description: args.description,
        "metadata.theoreticalPPH": args.theoretical_progressPerHour,
        requirementIDs: args.requirementIDs,
        recommendedIDs: args.recommendedIDs,
        taskIDs: args.taskIDs
      });
      return script.save();
    },
  }
}
