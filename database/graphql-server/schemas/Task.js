//@ts-check
const { getDocument,getDocuments,updateDocument,updateDocuments,deleteDocument,deleteDocuments } = require( './_shared/operations');
const { Account } = require('models/Account');
const { Script } = require('models/Script');
const { Task } = require('models/Task');
const { Requirement } = require('models/Requirement');

module.exports.typeDef = `
  type Task {
    id: ID!
    name: String!
    description: String!
    requirements: [Requirement]
    recommendeds: [Requirement]
    scripts: [Script]
    accounts: [Account]
  }
  input TaskInput {
    name: String!
    description: String!
    requirementIDs: [ID]
    recommendedIDs: [ID]
  }
  input TaskFilter {
    name: String
    description: String
    # requirements: [RequirementInput] #TODO figure out how to have filters be independent of ordering https://stackoverflow.com/questions/15268063/mongo-query-on-subfields
    # recommendeds: [RequirementInput]
  }

  #### Root ####

  extend type Query {
    task( filter:TaskFilter, random:Boolean ): Task
    tasks( filter:TaskFilter, random:Boolean, limit:Int ): [Task]
  }

  extend type Mutation {
    addTask( task:TaskInput! ): Task
    addTasks( tasks:[TaskInput]! ): [Task]
    updateTask( filter:TaskFilter! update:TaskFilter! ): Task
    updateTasks( filter:TaskFilter! update:TaskFilter! ): [Task]
    delTask( filter:TaskFilter! ): Task
    delTasks( filter:TaskFilter! ): [Task]
  }
`
module.exports.resolvers = {
  Task: {
    requirements: task => { return Requirement.find({
      _id:{ $in: task.requirementIDs }
    }); },
    recommendeds: task => { return Requirement.find({
      _id:{ $in: task.recommendedIDs }
    }); },
    accounts: task => { return Account.find({taskID: task.id}); },
    scripts: task => { return Script.find({taskIDs: task._id}); }
  },

  // ### Root ###
  Query:{
    task: getDocument(Task),
    tasks: getDocuments(Task)
  },
  Mutation: {
    addTask: (parent, args) => {
      let task = new Task(args.task);
      return task.save();
    },
    addTasks: (parent, args) => Task.insertMany(args.tasks),
    updateTask: updateDocument(Task),
    updateTasks: updateDocuments(Task),
    delTask: deleteDocument(Task),
    delTasks: deleteDocuments(Task),
  }
}