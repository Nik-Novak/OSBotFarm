//@ts-check
const{ transpileSchema } = require('graphql-s2s').graphqls2s;
const { renameProperties } = require('./_shared/functions')
const { Proxy, PROXY_AREAS } = require('models/Proxy');
const { Gameclient } = require('models/Gameclient')
const { getDocument,getDocuments,updateDocument,updateDocuments,deleteDocument,deleteDocuments } = require('./_shared/operations');
const { TLQueryOperators } = require('./_shared/transpileable-schemas');
module.exports.typeDef = `

  ${TLQueryOperators}

  type Proxy {
    id: ID!
    host: String!
    port: Int!
    area: ProxyArea!
    username: String
    password: String
    ip: String
    gameclients: [Gameclient]
  }
  input ProxyInput {
    host: String!
    port: Int!
    area: ProxyArea!
    username: String
    password: String
    ip: String
  }
  input ProxyFilter inherits TLQueryOperators<ProxyFilter>{
    id: ID
    host: String
    port: Int
    area: ProxyArea
    username: String
    password: String
    ip: String
  }

  #### Root ####

  extend type Query {
    proxy( filter:ProxyFilter, random:Boolean ): Proxy
    proxies( filter:ProxyFilter, random:Boolean, limit:Int ): [Proxy]
  }

  extend type Mutation {
    addProxy( proxy:ProxyInput! ): Proxy
    addProxies( proxies:[ProxyInput]! ): [Proxy]
    updateProxy( filter:ProxyFilter! update:ProxyFilter! ): Proxy
    updateProxies( filter:ProxyFilter! update:ProxyFilter! ): [Proxy]
    delProxy( filter:ProxyFilter! ): Proxy
    delProxies( filter:ProxyFilter! ): [Proxy]
  }
`
module.exports.resolvers = {
  Proxy: {
    gameclients: proxy => {return Gameclient.find({"systemProfile.proxyID": proxy._id})}
  },

  // ### Root ###
  Query:{
    proxy: getDocument(Proxy),
    proxies: getDocuments(Proxy)
  },
  Mutation: {
    addProxy: (parent, args) => {
      let proxy = new Proxy(args.proxy);
      return proxy.save();
    },
    addProxies: (parent, args) => Proxy.insertMany(args.proxies),
    updateProxy: updateDocument(Proxy),
    updateProxies: updateDocuments(Proxy),
    delProxy: deleteDocument(Proxy),
    delProxies: deleteDocuments(Proxy),
  }
}