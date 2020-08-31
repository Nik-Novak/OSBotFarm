//@ts-check
const { transpileSchema } = require('graphql-s2s').graphqls2s
const { renameProperties } = require('./_shared/functions')
const { getDocument,getDocuments,updateDocument,updateDocuments,deleteDocument,deleteDocuments } = require('./_shared/operations');
const { DeployedResource, DeployedGameclient, DeployedAccount } = require('models/DeployedResource');
const { Gameclient } = require('models/Gameclient');
const { Account } = require('models/Account');
const { Script } = require('models/Script');
const { World } = require('models/World');
const { TLQueryOperators } = require('./_shared/transpileable-schemas');
//testing
//https://graphql.osrsmillionaires.tk/test?query=%23%20mutation%20%7B%0A%23%20%20%20addGameclient(gameclient%3A%7BgameclientID%3A30001%2C%20systemProfile%3A%7BproxyID%3A%225e7598e8b871fa79d47a2899%22%7D%7D)%7B%0A%23%20%20%20%20%20gameclientID%0A%23%20%20%20%7D%0A%23%20%7D%0A%23%20mutation%20%7B%0A%23%20%20%20addDeployedGameclient(deployed_gameclient%3A%7BgameclientID%3A30000%7D)%7B%0A%23%20%20%20%20%20gameclientID%0A%23%20%20%20%20%20type%0A%23%20%20%20%20%20metadata%7B%0A%23%20%20%20%20%20%20%20creation%0A%23%20%20%20%20%20%7D%0A%23%20%20%20%7D%0A%23%20%7D%0A%23%20mutation%20%7B%0A%23%20%20%20addDeployedGameclients(deployed_gameclients%3A%5B%7BgameclientID%3A30000%7D%2C%7BgameclientID%3A30001%7D%5D)%7B%0A%23%20%20%20%20%20gameclientID%0A%23%20%20%20%20%20type%0A%23%20%20%20%20%20metadata%7B%0A%23%20%20%20%20%20%20%20creation%0A%23%20%20%20%20%20%7D%0A%23%20%20%20%7D%0A%23%20%7D%0A%0A%23%20%7B%0A%23%20%20%20accounts(filter%3A%7Bprayers%3A%7B%7D%2C%20creation%3A%222020-03-22T02%3A20%3A03.910Z%22%7D)%7B%0A%23%20%20%20%20%20username%0A%23%20%20%20%20%20xp%7Battack%20hitpoints%7D%0A%23%20%20%20%20%20creation%0A%23%20%20%20%20%20prayers%7B%0A%23%20%20%20%20%20%20%20preserve%0A%23%20%20%20%20%20%20%20chivalry%0A%23%20%20%20%20%20%20%20piety%0A%23%20%20%20%20%20%20%20rigour%0A%23%20%20%20%20%20%7D%0A%23%20%20%20%7D%0A%23%20%7D%0A%0A%23%20%7B%0A%23%20%20%20deployed_resources(filter%3A%7Btype%3ADeployedGameclient%2C%20metadata%3A%7Bcreation%3A%222020-03-22T03%3A47%3A57.742Z%22%7D%7D)%7B%0A%23%20%20%20%20%20type%0A%23%20%20%20%20%20metadata%7B%0A%23%20%20%20%20%20%20%20creation%0A%23%20%20%20%20%20%7D%0A%23%20%20%20%20%20...on%20DeployedGameclient%7B%0A%23%20%20%20%20%20%20%20gameclientID%0A%23%20%20%20%20%20%7D%0A%23%20%20%20%7D%0A%23%20%7D%0A%0A%23%20%7B%0A%23%20%20%20accounts(filter%3A%7Bxp%3A%7Battack%3A0%7D%7D)%7B%0A%23%20%20%20%20%20id%0A%23%20%20%20%20%20username%0A%23%20%20%20%20%20xp%7B%0A%23%20%20%20%20%20%20%20attack%0A%23%20%20%20%20%20%7D%0A%23%20%20%20%7D%0A%23%20%7D%0A%0A%23%20mutation%20%7B%0A%23%20%20%20delAccounts(filter%3A%7Bxp%3A%7Battack%3A0%7D%7D)%7B%0A%23%20%20%20%20%20id%0A%23%20%20%20%20%20username%0A%23%20%20%20%7D%0A%23%20%7D%0A%0A%23%20mutation%20%7B%0A%23%20%20%20updateGameclient(filter%3A%7BgameclientID%3A30001%7D%2C%20update%3A%7BgameclientID%3A30005%7D)%7B%0A%23%20%20%20%20%20gameclientID%0A%23%20%20%20%7D%0A%23%20%7D%0A%0A%23%20mutation%20%7B%0A%23%20%20%20addDeployedAccount(deployed_account%3A%7BaccountID%3A%225e76cab0e665dd5434891a82%22%2C%20deployedGameclientID%3A30000%20%7D)%0A%23%20%20%20%7B%0A%23%20%20%20%20%20accountID%0A%23%20%20%20%20%20deployedGameclientID%0A%23%20%20%20%7D%0A%23%20%7D%0A%0A%23%20mutation%20%7B%0A%23%20%20%20delDeployedResources(filter%3A%7Btype%3ADeployedAccount%7D)%7B%0A%23%20%20%20%20%20type%0A%23%20%20%20%20%20...on%20DeployedAccount%7B%0A%23%20%20%20%20%20%20%20accountID%0A%23%20%20%20%20%20%20%20deployedGameclientID%0A%23%20%20%20%20%20%7D%0A%23%20%20%20%7D%0A%23%20%7D%0A%0A%23%20mutation%20%7B%0A%23%20%20%20delDeployedResource(filter%3A%7BgameclientID%3A30000%7D)%7B%0A%23%20%20%20%20%20type%0A%23%20%20%20%20%20...on%20DeployedGameclient%7B%0A%23%20%20%20%20%20%20%20gameclientID%0A%23%20%20%20%20%20%20%20type%0A%23%20%20%20%20%20%20%20metadata%7B%0A%23%20%20%20%20%20%20%20%20%20creation%0A%23%20%20%20%20%20%20%20%7D%0A%23%20%20%20%20%20%7D%0A%23%20%20%20%7D%0A%23%20%7D%0A%0A%23%20mutation%20%7B%0A%23%20%20%20addSkillRequirement(name%3A%22sda%22%2C%20description%3A%22asdas%22%2C%20skill%3Aattack%2C%20target_level%3A30)%7B%0A%23%20%20%20%20%20skill%0A%23%20%20%20%20%20type%0A%23%20%20%20%7D%0A%23%20%7D%0A%0A%23%20%7B%0A%23%20%20%20deployed_resources%7B%0A%23%20%20%20%20%20type%0A%23%20%20%20%20%20metadata%7B%0A%23%20%20%20%20%20%20%20creation%0A%23%20%20%20%20%20%20%20creation%0A%23%20%20%20%20%20%7D%0A%23%20%20%20%20%20...on%20DeployedGameclient%7B%0A%23%20%20%20%20%20%20%20gameclientID%0A%23%20%20%20%20%20%7D%0A%23%20%20%20%7D%0A%23%20%7D

module.exports.typeDef = transpileSchema(`

  ${TLQueryOperators}

  enum DeployedResourceType {
    DeployedGameclient, DeployedAccount
  }

  type DeployedResourceMetadata {
    ready: Boolean!
    created: DateTime!
    deployed: DateTime
  }
  input DeployedResourceMetadataFilter {
    ready: Boolean
    created: DateTime
    deployed: DateTime
  }

  interface DeployedResource {
    type: DeployedResourceType!
    metadata: DeployedResourceMetadata!
  }
  input _deployedResourceFilter { #This syntax indicates it's not meant to be used for anything but inheritance/internal use
    type: DeployedResourceType
    metadata: DeployedResourceMetadataFilter
  }

  ############## DeployedGameclient ##############
  type InstalledScript {
    name: String!
    branch: String!
  }
  input InstalledScriptInput {
    name: String!
    branch: String!
  }
  input InstalledScriptFilter {
    name: String
    branch: String
  }

  type DeployedGameclient inherits DeployedResource implements DeployedResource {
    gameclientID: Int!
    installedScript: InstalledScript!
    gameclient: Gameclient!
    running: Boolean!
  }
  input DeployedGameclientInput {
    gameclientID: Int!
    installedScript: InstalledScriptInput!
  }
  input DeployedGameclientFilter inherits _deployedResourceFilter {
    gameclientID: Int
    installedScript: InstalledScriptFilter
    running: Boolean
  }

  ############## DeployedAccount ##############
  type Manager {
    host: String!
    port: Int!
  }
  input ManagerInput {
    host: String!
    port: Int!
  }
  input ManagerFilter {
    host: String
    port: Int
  }

  type DeployedAccount inherits DeployedResource implements DeployedResource {
    accountID: ID!
    account: Account!
    deployedGameclient: DeployedGameclient!
    script: Script!
    world: World!
    manager: Manager
    method: String # subject to change and replaced by Script
    run_energy: Int # subject to removal/change
  }
  input DeployedAccountInput {
    accountID: ID!
    deployedGameclientID: Int!
    scriptID: ID!
    world: Int!
    manager: ManagerInput
    method: String # subject to change and replaced by Script
    run_energy: Int # subject to removal/change
  }
  input DeployedAccountFilter inherits _deployedResourceFilter {
    accountID: ID
    deployedGameclientID: Int
    scriptID: ID
    world: Int
    manager: ManagerFilter
  }

  input DeployedResourceFilter inherits TLQueryOperators<DeployedResourceFilter>,DeployedGameclientFilter,DeployedAccountFilter {
  }

  #### Root ####

  extend type Query {
    deployed_resource( filter:DeployedResourceFilter, random:Boolean ): DeployedResource
    deployed_resources( filter:DeployedResourceFilter, random:Boolean, limit:Int ): [DeployedResource]
  }

  extend type Mutation {
    addDeployedGameclient( deployed_gameclient:DeployedGameclientInput! ): DeployedGameclient
    addDeployedGameclients( deployed_gameclients:[DeployedGameclientInput]! ): [DeployedGameclient]
    addDeployedAccount( deployed_account:DeployedAccountInput! ): DeployedAccount
    addDeployedAccounts( deployed_accounts:[DeployedAccountInput]! ): [DeployedAccount]
    updateDeployedResource( filter:DeployedResourceFilter!, update:DeployedResourceFilter! ): DeployedResource #TODO Report weird discovered GraphQL bug where comma is required here, but on in accounts update. Might have to do with schema transpile. 
    updateDeployedResources( filter:DeployedResourceFilter!, update:DeployedResourceFilter! ): [DeployedResource]
    delDeployedResource( filter:DeployedResourceFilter! ): DeployedResource
    delDeployedResources( filter:DeployedResourceFilter! ): [DeployedResource]
  }
`)
module.exports.resolvers = {
  DeployedResource:{
    __resolveType(obj, context, info){
      return obj._type
    },
    type: requirement=>(requirement._type),
  },
  get DeployedGameclient(){
    return (
      {
        ...this.DeployedResource, //inherits resolvers from DeployedResource
        //custom DeployedGameclient resolvers
        gameclient: deployedgameClient => 
          Gameclient.findOne({ gameclientID: deployedgameClient.gameclientID })
      }
    )
  },
  get DeployedAccount(){
    return (
      {
        ...this.DeployedResource, //inherits resolvers from DeployedResource
        account: deployedAccount => Account.findById(deployedAccount.accountID),
        deployedGameclient: deployedAccount => DeployedGameclient.findOne({gameclientID:deployedAccount.deployedGameclientID}),
        script: deployedAccount => Script.findById(deployedAccount.scriptID),
        world: deployedAccount => World.findOne({world:deployedAccount.world}),
      }
    )
  },

  // ### Root ###
  Query:{
    deployed_resource: getDocument(DeployedResource),
    deployed_resources: getDocuments(DeployedResource)
  },
  Mutation: {
    
    // DeployedGameclients
    addDeployedGameclient: (parent, args) => {
      let deployedGameclient = new DeployedGameclient(args.deployed_gameclient);
      return deployedGameclient.save();
    },
    addDeployedGameclients: (parent, args) => DeployedGameclient.insertMany(args.deployed_gameclients),
    
    // DeployedAccounts
    addDeployedAccount: (parent, args) => {
      let deployedAccount = new DeployedAccount(args.deployed_account);
      return deployedAccount.save();
    },
    addDeployedAccounts: (parent, args) => DeployedAccount.insertMany(args.deployed_accounts),

    // generic resolvers
    updateDeployedResource: updateDocument(DeployedResource),
    updateDeployedResources: updateDocuments(DeployedResource),
    delDeployedResource: deleteDocument(DeployedResource),
    delDeployedResources: deleteDocuments(DeployedResource),
  }
}