// const {GraphQLObjectType, GraphQLString, GraphQLID, GraphQLInt} = require('graphql');
// const TaskType = require('./Task');
// const { Account } = require('../models/Account');
// const { Task } = require('../models/Task');

// const AccountType = new GraphQLObjectType(
//   {
//     name: 'Account',
//     fields: () => ({
//       id: { type: GraphQLID },
//       username: { type: GraphQLString },
//       password: { type: GraphQLString },
//       level: { type: GraphQLInt },
//       task: { 
//         type: TaskType,
//         resolve(parent, args){
//           // const record = await Account.findById(parent.id); //why dont we need this??
//           return Task.findById(parent.taskID);
//           // return _.find(tasks, {id: parent.taskID})
//         }
//       }
//     })
//   }
// )

// module.exports = AccountType
// const {GraphQLObjectType, GraphQLString, GraphQLID, GraphQLInt} = require('graphql');
// const TaskType = require('./Task');
// const { Account } = require('../models/Account');
// const { Task } = require('../models/Task');

// const AccountType = new GraphQLObjectType(
//   {
//     name: 'Account',
//     fields: () => ({
//       id: { type: GraphQLID },
//       username: { type: GraphQLString },
//       password: { type: GraphQLString },
//       level: { type: GraphQLInt },
//       task: { 
//         type: TaskType,
//         resolve(parent, args){
//           // const record = await Account.findById(parent.id); //why dont we need this??
//           return Task.findById(parent.taskID);
//           // return _.find(tasks, {id: parent.taskID})
//         }
//       }
//     })
//   }
// )

// module.exports = AccountType