//@ts-check
const { transpileSchema } = require('graphql-s2s').graphqls2s;
const { generateUUID, generateMacAddress } = require('./_shared/functions')
const { getDocument, getDocuments, updateDocument, updateDocuments, deleteDocument, deleteDocuments } = require('./_shared/operations')
const { Gameclient } = require('models/Gameclient');
const { Proxy } = require('models/Proxy');
const { Script } = require('models/Proxy');
const { TLQueryOperators } = require('./_shared/transpileable-schemas');
module.exports.typeDef = transpileSchema(`

  ${TLQueryOperators}

  type SystemProfile {
    proxy: Proxy!
    os: String!
    UUID: String
    MACAddress: String
  }
  input SystemProfileInput {
    proxyID: ID!
    os: String
    UUID: String
    MACAddress: String
  }
  input SystemProfileFilter {
    proxyID: ID!
    os: String
    UUID: String
    MACAddress: String
  }

  type Gameclient {
    gameclientID: Int!
    systemProfile: SystemProfile!
  }
  input GameclientInput {
    gameclientID: Int
    systemProfile: SystemProfileInput!
  }
  input GameclientFilter {
    id: ID
    gameclientID: Int
    systemProfile: SystemProfileFilter
  }

  #### Root ####

  extend type Query {
    gameclient( filter:GameclientFilter, random:Boolean ): Gameclient
    gameclients( filter:GameclientFilter, random:Boolean, limit:Int ): [Gameclient]
  }

  extend type Mutation {
    addGameclient( gameclient:GameclientInput! ): Gameclient
    addGameclients( gameclients:[GameclientInput]! ): [Gameclient]
    updateGameclient( filter:GameclientFilter!, update:GameclientFilter! ): Gameclient
    updateGameclients( filter:GameclientFilter!, update:GameclientFilter! ): [Gameclient]
    delGameclient( filter:GameclientFilter! ): Gameclient
    delGameclients( filter:GameclientFilter! ): [Gameclient]
  }
`);

module.exports.resolvers = {
  SystemProfile: {
    proxy: systemProfile => Proxy.findById(systemProfile.proxyID)
  },

  // ### Root ###
  Query:{
    gameclient: getDocument(Gameclient),
    gameclients: getDocuments(Gameclient)
  },
  Mutation: {

    addGameclient: async (parent, args) => {
      args.gameclient.systemProfile.UUID = args.gameclient.systemProfile.UUID || await generateUUID(args.gameclient.systemProfile.os);
      args.gameclient.systemProfile.MACAddress = args.gameclient.systemProfile.MACAddress || generateMacAddress();
      let gameclient = new Gameclient(args.gameclient);
      return gameclient.save();
    },
    addGameclients: async (parent, args) => {
      for (let gameclient of args.gameclients){
        gameclient.systemProfile.UUID = gameclient.systemProfile.UUID || await generateUUID(gameclient.systemProfile.os);
        gameclient.systemProfile.MACAddress = gameclient.systemProfile.MACAddress || generateMacAddress();
      }
      return Gameclient.insertMany(args.gameclients)
    },
    updateGameclient: updateDocument(Gameclient),
    updateGameclients: updateDocuments(Gameclient),
    delGameclient: deleteDocument(Gameclient),
    delGameclients: deleteDocuments(Gameclient),

    // addGameclient: async (parent, args) => {
    //   function generateMacAddress(vendor){ //TODO vendor
    //     return "XX:XX:XX:XX:XX:XX".replace(/X/g, function() {
    //       return "0123456789ABCDEF".charAt(Math.floor(Math.random() * 16))
    //     });
    //   }
    //   async function generateUUID(os){
    //     // @ts-ignore
    //     let UUID = (await axios.get('https://www.uuidgenerator.net/api/version4')).data.trim();
    //     if(os && os.includes('windows'))
    //       UUID = UUID.toUpperCase();
    //     return UUID
    //   }
    //   let gameclient = new Gameclient({
    //     gameclientID: args.gameclientID,
    //     "systemProfile.proxyID": args.systemProfile.proxyID,
    //     "systemProfile.os": args.systemProfile.os,
    //     "systemProfile.UUID": args.systemProfile.UUID || await generateUUID(args.os), //user supplied value, or generated value
    //     "systemProfile.MACAddress": args.systemProfile.MACAddress || generateMacAddress(),
    //   });
    //   return gameclient.save();
    // }
  }
}