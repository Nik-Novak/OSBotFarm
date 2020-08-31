//@ts-check
const { transpileSchema } = require('graphql-s2s').graphqls2s;
const { World } = require('models/World');
const { Requirement } = require('models/Requirement');
const { getDocument,getDocuments,updateDocument,updateDocuments,deleteDocument,deleteDocuments } = require('./_shared/operations');
const { TLQueryOperators } = require('./_shared/transpileable-schemas');
module.exports.typeDef = transpileSchema(`

  ${TLQueryOperators}

  enum WorldKind{
    regular, pvp, dmm, twisted_league, beta
  }
  enum WorldLocation {
    us, uk, de, au
  }

  type World {
    world:Int!
    location:WorldLocation!
    members:Boolean!
    kind:WorldKind!
    activity:String
    requirements:[Requirement]!
  }
  input WorldInput {
    world:Int!
    location:WorldLocation!
    members:Boolean!
    kind:WorldKind!
    activity: String
    requirementIDs:[ID]
  }
  input WorldFilter inherits TLQueryOperators<WorldFilter>{
    world: ValueFilter
    location:WorldLocation
    members:Boolean
    kind:WorldKind
    activity: String
    requirementIDs:[ID]  # TEST https://stackoverflow.com/questions/49897319/graphql-union-scalar-type
  }

  #input TestFilter {
  #  nin : [Int]
  #}
  # union Test = Int | ArrayFilter
  # union IDArrayFilter = ID | ArrayFilter

  #### Root ####

  extend type Query {
    world( filter:WorldFilter, random:Boolean ): World
    worlds( filter:WorldFilter, random:Boolean, limit:Int ): [World]
  }

  extend type Mutation {
    addWorld( world:WorldInput! ): World
    addWorlds( worlds:[WorldInput]! ): [World]
    updateWorld( filter:WorldFilter!, update:WorldFilter! ): World
    updateWorlds( filter:WorldFilter!, update:WorldFilter! ): [World]
    delWorld( filter:WorldFilter! ): World
    delWorlds( filter:WorldFilter! ): [World]
  }
`);
module.exports.resolvers = {

  World: {
    requirements: world=>Requirement.find({_id:{ $in:world.requirementIDs }})
  },

  // ### Root ###
  Query:{
    world: getDocument(World),
    worlds: getDocuments(World),
  },
  Mutation: {
    addWorld: (parent, args) => {
      let world = new World(args.world);
      return world.save();
    },
    addWorlds: (parent, args) => World.insertMany(args.worlds),
    updateWorld: updateDocument(World),
    updateWorlds: updateDocuments(World),
    delWorld: deleteDocument(World),
    delWorlds: deleteDocuments(World),
  }
}