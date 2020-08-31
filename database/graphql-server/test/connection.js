//@ts-check
const config = require('config');

const models =require('models');

// set mongoose internal promises
models.Promise = global.Promise;

//connect to DB before tests run
// @ts-ignore
before(function(done){
  preliminaryChecks(config).then(()=>{ //safety check to ensure no data corruption on anything except production dataset
    models.connect(config.get('db'), 
      { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }
    );

    models.connection
      .once('open', function(){
        console.log('Connected to DB');
        done();
      })
      .on('error',function(err){
        console.log('Failed to connect to DB: ');
        console.error(err);
      });
  });
});

// drop accounts collection before each test
// @ts-ignore
beforeEach(function(done){
  done();
});

//disconnect after tests run
// @ts-ignore
after(function(done){
  models.connection.close(function(){
    done();
  });
});

async function preliminaryChecks(config){ //safety check ensuring nothing but test database is modified
  if(process.env.NODE_ENV!='test')
    throw Error('NODE_ENV must be set to test. This check is in place to ensure production data isn\'t altered by tests on the wrong dataset. ')
  const { ApolloClient, gql } = require('apollo-boost');
  const { InMemoryCache } =require('apollo-cache-inmemory');
  const { HttpLink } =require('apollo-link-http');
  const fetch = require('node-fetch');
  
  const link = new HttpLink({
    uri: `${config.get('protocol')}://${config.get('host')}:${config.get('port')}/graphql`,
    // @ts-ignore
    fetch
  });
  const cache = new InMemoryCache();
  const client = new ApolloClient({
    link,
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
let query = gql`
  query {
    info {
      api_version
      environment
    }
  }
`
let result = await client.query({query});
if(result.data.info.environment!='test')
  throw Error('The graphql server appears to not be using the test environment, it was instead using: '+result.data.info.environment+'. This check prevented any data loss to databases other than the test database.')
}