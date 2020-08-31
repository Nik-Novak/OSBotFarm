//@ts-check
const { transpileSchema } = require('graphql-s2s').graphqls2s;
const { Email } = require('models/Email');
const { renameProperties } = require('./_shared/functions')
const { getDocument,getDocuments,updateDocument,updateDocuments,deleteDocument,deleteDocuments } = require('./_shared/operations');
const { TLQueryOperators } = require('./_shared/transpileable-schemas');
module.exports.typeDef = transpileSchema(`

  ${TLQueryOperators}

  type Email {
    id: ID!
    username: String!
    domain: String!
    email: String!
    accessible: Boolean!
  }
  input EmailInput {
    username: String!
    domain: String!
    accessible: Boolean!
  }
  input EmailFilter inherits TLQueryOperators<EmailFilter>{
    id: ID
    username: String
    domain: String
    accessible: Boolean
  }

  #### Root ####

  extend type Query {
    email( filter:EmailFilter, random:Boolean ): Email
    emails( filter:EmailFilter, random:Boolean, limit:Int ): [Email]
  }

  extend type Mutation {
    addEmail( email:EmailInput! ): Email
    addEmails( emails:[EmailInput]! ): [Email]
    updateEmail( filter:EmailFilter!, update:EmailFilter! ): Email
    updateEmails( filter:EmailFilter!, update:EmailFilter! ): [Email]
    delEmail( filter:EmailFilter! ): Email
    delEmails( filter:EmailFilter! ): [Email]
  }
`);

module.exports.resolvers = {
  Email: {
    email: email => email.username+'@'+email.domain
  },

  // ### Root ###
  Query:{
    email: getDocument(Email),
    emails: getDocuments(Email)
  },
  Mutation: {
    addEmail: (parent, args) => {
      let email = new Email(args.email);
      return email.save();
    },
    addEmails: (parent, args) => Email.insertMany(args.emails),
    updateEmail: updateDocument(Email),
    updateEmails: updateDocuments(Email),
    delEmail: deleteDocument(Email),
    delEmails: deleteDocuments(Email),
  }
}