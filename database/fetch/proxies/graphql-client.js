//@ts-check
const { ApolloClient, ApolloLink, HttpLink, InMemoryCache, gql } = require('apollo-boost');
const fetch = require('node-fetch');

class GraphQLClient extends ApolloClient{
  constructor(url, authToken){
    //set Authoriation headers on all requests
    const authLink = new ApolloLink((operation, forward) => { 
      operation.setContext({
        headers: {
          authorization: authToken ? `Basic ${authToken}` : ''
        }
      });
      return forward(operation);
    });
    //link to http url
    const httpLink = new HttpLink({
      uri: url,
      // @ts-ignore
      fetch
    });
    //use memory cache
    const cache = new InMemoryCache();
    //create ApolloClient
    super({
      link: authLink.concat(httpLink), //merge our authentication link and http link into one
      cache,
      defaultOptions: {
        mutate:{
          fetchPolicy: 'no-cache',
        },
        query:{
          fetchPolicy: 'no-cache',
        },
        watchQuery:{
          fetchPolicy: 'no-cache',
        },
      }
    });
  }
}

module.exports = { GraphQLClient };
