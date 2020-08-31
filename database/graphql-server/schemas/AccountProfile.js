//@ts-check
const { transpileSchema } = require('graphql-s2s').graphqls2s;
const { getDocument,getDocuments,updateDocument,updateDocuments,deleteDocument,deleteDocuments } = require('./_shared/operations');
const { AccountProfile } = require('models/AccountProfile');
const { TLQueryOperators } = require('./_shared/transpileable-schemas');

module.exports.typeDef = transpileSchema(`

  ${TLQueryOperators}

  type BehaviourProfile {
    min_reaction:Float!
    afk_amount:Float!
    camera_movement:Float!
  }
  input BehaviourProfileInput {
    min_reaction:Float!
    afk_amount:Float!
    camera_movement:Float!
  }
  input BehaviourProfileFilter {
    min_reaction:Float
    afk_amount:Float
    camera_movement:Float
  }

  type MouseProfile {
    mouse_hop:Boolean!
    hover_amount:Float!
    multi_click_chance:Float!
  }
  input MouseProfileInput {
    mouse_hop:Boolean!
    hover_amount:Float!
    multi_click_chance:Float!
  }
  input MouseProfileFilter {
    mouse_hop:Boolean
    hover_amount:Float
    multi_click_chance:Float
  }

  type AccountProfile {
    behaviour:BehaviourProfile!
    mouse:MouseProfile!
  }
  input AccountProfileInput {
    behaviour:BehaviourProfileInput!
    mouse:MouseProfileInput!
  }
  input AccountProfileFilter inherits TLQueryOperators<AccountProfileFilter>{
    behaviour:BehaviourProfileFilter
    mouse:MouseProfileFilter
  }

  #### Root ####

  extend type Query {
    account_profile( filter:AccountProfileFilter, random:Boolean ): AccountProfile
    account_profiles( filter:AccountProfileFilter, random:Boolean, limit:Int ): [AccountProfile]
  }

  extend type Mutation {
    addAccountProfile( account_profile:AccountProfileInput! ): AccountProfile
    addAccountProfiles( account_profiles:[AccountProfileInput]! ): [AccountProfile]
    updateAccountProfile( filter:AccountProfileFilter!, update:AccountProfileFilter! ): AccountProfile
    updateAccountProfiles( filter:AccountProfileFilter!, update:AccountProfileFilter! ): [AccountProfile]
    delAccountProfile( filter:AccountProfileFilter! ): AccountProfile
    delAccountProfiles( filter:AccountProfileFilter! ): [AccountProfile]
  }
`);

module.exports.resolvers = {

  // ### Root ###
  Query:{
    account_profile: getDocument(AccountProfile),
    account_profiles: getDocuments(AccountProfile)
  },
  Mutation: {
    addAccountProfile: (parent, args) => {
      let account_profile = new AccountProfile(args.account_profile);
      return account_profile.save();
    },
    addAccountProfiles: (parent, args) => AccountProfile.insertMany(args.account_profiles),
    updateAccountProfile: updateDocument(AccountProfile),
    updateAccountProfiles: updateDocuments(AccountProfile),
    delAccountProfile: deleteDocument(AccountProfile),
    delAccountProfiles: deleteDocuments(AccountProfile),
  }
}