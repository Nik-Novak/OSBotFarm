// const { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLList } = require('graphql');
// const AccountType = require('./Account');
// const { Account } = require('../models/Account');
// const { Task } = require('../models/Task');

// const TaskType = new GraphQLObjectType(
//   {
//     name: 'Task',
//     fields: () => ({
//       id: { type: GraphQLID },
//       name: { type: GraphQLString },
//       description: { type: GraphQLString },
//       accounts: {
//         type: GraphQLList(AccountType),
//         resolve(parent, args){
//           return Account.find({taskID: parent.id});
//           // return _.filter(accounts, {taskID: parent.id});
//         }
//       }
//     })
//   }
// )

// module.exports = TaskType;