//@ts-check
const { renameProperties } = require('./_shared/functions')
const { GameObject } = require('models/GameObject');
const { getDocument,getDocuments,updateDocument,updateDocuments,deleteDocument,deleteDocuments } = require('./_shared/operations');

module.exports.typeDef = `

  type GameObject {
    gameID: Int!
    name: String!
    interactions: [String]!
    reporting: Reporting!
    examine: String
  }
  input GameObjectReport {
    gameID: Int!
    name: String!
    interactions: [String]!
    examine: String
  }
  input GameObjectFilter {
    gameID: Int
    name: String
    interactions: [String]
    reporting: ReportingFilter
    examine: String
  }

  ################ Namespaced Mutations ################
  type GameObjectStaticMutations{
    report( game_object:GameObjectReport ):GameObject
  }

  #### Root ####
  extend type Query {
    game_object( filter:GameObjectFilter, random:Boolean ): GameObject
    game_objects( filter:GameObjectFilter, random:Boolean, limit:Int ): [GameObject]
  }

  extend type Mutation {
    # namespaced static mutations
    GameObject:GameObjectStaticMutations

    updateGameObject( filter:GameObjectFilter! update:GameObjectFilter! ): GameObject
    updateGameObjects( filter:GameObjectFilter! update:GameObjectFilter! ): [GameObject]
    delGameObject( filter:GameObjectFilter! ): GameObject
    delGameObjects( filter:GameObjectFilter! ): [GameObject]
  }
`
module.exports.resolvers = {

  GameObjectStaticMutations: {
    report: (staticArgs, args)=>{
      GameObject.findOneAndUpdate()
    }
  },

  // ### Root ###
  Query:{
    game_object: getDocument(GameObject),
    game_objects: getDocuments(GameObject)
  },
  Mutation: {
    GameObject: (parent, staticArgs)=>(staticArgs), //pass args from static namespace mutation to further resolvers
    updateGameObject: updateDocument(GameObject),
    updateGameObjects: updateDocuments(GameObject),
    delGameObject: deleteDocument(GameObject),
    delGameObjects: deleteDocuments(GameObject),
  }
}