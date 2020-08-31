//@ts-check
const config = require('config');
const { makeExecutableSchema } = require('graphql-tools');
const { merge } = require('lodash');

const models = require('models');
const { Item } = require('models/Item');

const { GraphQLDateTime } = require('graphql-iso-date');
const { GraphQLValueFilter } = require('./custom-scalars/GraphQLValueFilter');

const { typeDef:emailDef, resolvers:emailResolvers } = require('./Email');
const { typeDef:accountProfileDef, resolvers:accountProfileResolvers } = require('./AccountProfile');
const { typeDef:accountDef, resolvers:accountResolvers } = require('./Account');
const { typeDef:taskDef, resolvers:taskResolvers } = require('./Task');
const { typeDef:proxyDef, resolvers:proxyResolvers } = require('./Proxy');
const { typeDef:scriptDef, resolvers:scriptResolvers } = require('./Script');
const { typeDef:gameclientDef, resolvers:gameclientResolvers } = require('./Gameclient');
const { typeDef:requirementDef, resolvers:requirementResolvers } = require('./Requirement');
const { typeDef:deployedResourceDef, resolvers:deployedResourceResolvers } = require('./DeployedResource');
const { typeDef:worldDef, resolvers:worldResolvers } = require('./World');
const { typeDef:itemDef, resolvers:itemResolvers } = require('./Item');
const { typeDef:gameObjectDef, resolvers:gameObjectResolvers } = require('./GameObject');

const globalDef = `
  scalar DateTime
  scalar ValueFilter

  type Stats {
    attack: Int,
    strength: Int,
    defence: Int,
    ranged: Int,
    prayer: Int,
    magic: Int,
    runecrafting: Int,
    construction: Int,
    hitpoints: Int,
    agility: Int,
    herblore: Int,
    thieving: Int,
    crafting: Int,
    fletching: Int,
    slayer: Int,
    hunter: Int,
    mining: Int,
    smithing: Int,
    fishing: Int,
    cooking: Int,
    firemaking: Int,
    woodcutting: Int,
    farming: Int
  }
  input StatsInput {
    attack: Int,
    strength: Int,
    defence: Int,
    ranged: Int,
    prayer: Int,
    magic: Int,
    runecrafting: Int,
    construction: Int,
    hitpoints: Int,
    agility: Int,
    herblore: Int,
    thieving: Int,
    crafting: Int,
    fletching: Int,
    slayer: Int,
    hunter: Int,
    mining: Int,
    smithing: Int,
    fishing: Int,
    cooking: Int,
    firemaking: Int,
    woodcutting: Int,
    farming: Int
  }

  enum Skill {
    attack,strength,defence,ranged,prayer,magic,runecrafting,construction,hitpoints,agility,herblore,thieving,crafting,fletching,slayer,hunter,mining,smithing,fishing,cooking,firemaking,woodcutting,farming
  }

  type ContainerItem {
    item:Item!
    slot:Int!
    quantity:Int
  }
  input ContainerItemInput {
    itemID:ID!
    slot:Int!
    quantity:Int
  }
  input ContainerItemFilter {
    itemID:ID
    slot:Int
    quantity:Int
  }

  type Report {
    reporting_accountID: ID!,
    date: DateTime!,
  }
  input ReportInput {
    reporting_accountID: ID!,
    date: DateTime!,
  }
  input ReportFilter {
    reporting_accountID: ID,
    date: DateTime,
  }

  type Reporting {
    number: Int!
    last: Report
  }
  input ReportingFilter {
    number: Int
    last: ReportFilter
  }

  
  
`

const queryDef = `
  type Info {
    api_version: String
    environment: String
  }

  type Query {
    info: Info
  }
`
const mutationDef = `
  type Mutation {
    api_version: String
  }
`
const globalResolvers={
  DateTime: GraphQLDateTime,
  ValueFilter: GraphQLValueFilter,
  ContainerItem: {
    item:(iqPair, args) => Item.findOne({itemID:iqPair.itemID})
  }
}
const queryResolvers={
  Query: {
    info: ()=>(
      {
        api_version: config.get('api_version'),
        environment: models.connection.db.databaseName,
      }
    )
  },
}

const mutationResolvers = {
  Mutation: {
    api_version: ()=>("v1.0.0")
  }
}

module.exports = makeExecutableSchema(
  {
    typeDefs: [globalDef, queryDef, mutationDef, proxyDef, emailDef, accountProfileDef, accountDef, taskDef, scriptDef, gameclientDef, requirementDef, deployedResourceDef, worldDef, itemDef, gameObjectDef],
    resolvers: merge(globalResolvers, queryResolvers, mutationResolvers, proxyResolvers, emailResolvers, accountProfileResolvers, accountResolvers, taskResolvers, scriptResolvers, gameclientResolvers, requirementResolvers, deployedResourceResolvers, worldResolvers, itemResolvers, gameObjectResolvers)
  }
);