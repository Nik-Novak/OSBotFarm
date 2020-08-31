const {GraphQLClient, gql} = require('graphql-client');




async function patch(){
  let authUsername='client';
  let authPassword = '3dnT-$CZd*l0y0zF';
  let basicAuthToken = Buffer.from(authUsername+':'+authPassword).toString('base64');
  const grapQLClient = new GraphQLClient('https://graphql.osrsmillionaires.tk', basicAuthToken);

  let result = await grapQLClient.query({query:gql`
    {
      proxies {
        id
        host
        area
      }
    }
  `});

  for(proxy of result.data.proxies){
    let updateResult = await grapQLClient.mutate({mutation:gql`
      mutation ($id:ID!, $area:ProxyArea!){
        updateProxy(filter:{id:$id}, update:{area:$area}){
          id
          host
          area
        }
      }
    `,
    variables:{
      "id": proxy.id,
      "area": proxy.host.substring(0,2)
    }
    });
    console.log('UPDATED:', updateResult.data.updateProxy)
  };
}

patch();