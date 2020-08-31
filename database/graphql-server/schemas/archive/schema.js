const { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLSchema, GraphQLID, GraphQLList, GraphQLNonNull } = require('graphql');
const _ = require('lodash');
const { Account } = require('../models/Account');
const { Task } = require('../models/Task');

// let accounts = [
//   { id: '1', username: 'username1', password: 'password1', level: 23, taskID: '1'},
//   { id: '2', username: 'username2', password: 'password2', level: 24, taskID: '1'},
//   { id: '3', username: 'username3', password: 'password3', level: 25, taskID: '3'},
// ]

// let tasks = [
//   { id: '1', name: 'moneymaking', description: 'Make some gp' },
//   { id: '2', name: 'woodcutting', description: 'Train woodcutting skill' },
//   { id: '3', name: 'fishing', description: 'Train fishing skill' }
// ]

const AccountType = new GraphQLObjectType(
  {
    name: 'Account',
    fields: () => ({
      id: { type: GraphQLID },
      username: { type: GraphQLString },
      password: { type: GraphQLString },
      level: { type: GraphQLInt },
      task: { 
        type: TaskType,
        resolve(parent, args){
          // const record = await Account.findById(parent.id); //why dont we need this??
          return Task.findById(parent.taskID);
          // return _.find(tasks, {id: parent.taskID})
        }
      }
    })
  }
)

const TaskType = new GraphQLObjectType(
  {
    name: 'Task',
    fields: () => ({
      id: { type: GraphQLID },
      name: { type: GraphQLString },
      description: { type: GraphQLString },
      accounts: {
        type: GraphQLList(AccountType),
        resolve(parent, args){
          return Account.find({taskID: parent.id});
          // return _.filter(accounts, {taskID: parent.id});
        }
      }
    })
  }
)

const RootQuery = new GraphQLObjectType(
  {
    name: 'RootQueryType',
    fields: {
      accounts: {
        type: GraphQLList(AccountType),
        resolve(parent, args){
          return Account.find({});
        }
      },
      account: {
        type: AccountType,
        args: {
          id: { type: GraphQLID },
          username: { type: GraphQLString },
        },
        resolve(parent, args){
          //code to get data from db
          let selector = {}
          if(args.id)
            selector._id = args.id;
          if(args.username)
            selector.username=args.username;
          return Account.findOne(selector);
        }
      },
      tasks: {
        type: GraphQLList(TaskType),
        resolve(parent, args) {
          return Task.find({});
        }
      },
      task: {
        type: TaskType,
        args: { id: { type: GraphQLID } },
        args: { name: { type: GraphQLString } },
        resolve(parent, args){
          // code to get data from db
          let selector = {}
          if(args.id)
            selector._id = args.id;
          if(args.name)
            selector.name=args.name;
          return Task.findOne(selector);
        }
      }
    }
  }
);

const Mutation = new GraphQLObjectType( //updating data
  {
    name: 'Mutation',
    fields: {
      addAccount: { // ADD ACCOUNT
        type: AccountType,
        args: {
          username: { type: GraphQLNonNull(GraphQLString) },
          password: { type: GraphQLNonNull(GraphQLString) },
          level: { type: GraphQLInt },
          taskID: { type: GraphQLID }
        },
        async resolve(parent, args){
          let account = new Account(
            {
              username: args.username,
              password: args.password,
              level: args.level,
              taskID: args.taskID
            }
          );
          const record = await account.save();
          console.log('Account saved!', record);
          return record;
        }
      },
      addTask:{ //ADD TASK
        type: TaskType,
        args: {
          name: { type: GraphQLNonNull(GraphQLString) },
          description: { type: GraphQLNonNull(GraphQLString) }
        },
        async resolve(parent, args){
          let task = new Task(
            {
              name: args.name,
              description: args.description
            }
          );
          const record = await task.save();
          console.log('Task saved!', record);
          return record;
        }
      }
    }
  }
)

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});