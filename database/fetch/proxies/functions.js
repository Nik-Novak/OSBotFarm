//@ts-check
const path = require('path');
const fs = require('fs');
// @ts-ignore
const ReadableStream = require('stream').Readable;
const https =require ('https');
const { SocksProxyAgent } = require('socks-proxy-agent');
const axios = require('axios');
const cheerio = require('cheerio');
const { gql } = require('apollo-boost');
const { logger } = require('./logger');
// @ts-ignore
const JSONStream = require('JSONStream');

// @ts-ignore
const { GraphQLClient } = require('./graphql-client')

/**
 * @typedef {object} Proxy
 * @property {string} id
 * @property {string} host
 * @property {number} port
 * @property {string} username
 * @property {string} password
 */
/**
  * @param {Proxy} proxy 
  * @param {GraphQLClient} graphqlClient 
  * @returns {Promise<Proxy>}
  */
 async function saveProxy(proxy, graphqlClient){
  let result = await graphqlClient.query({
    query:gql`
      mutation ($proxy:ProxyInput!){
        addProxy( proxy:$proxy ){
          id
          host
          port
        }
      }
    `,
    variables:{proxy}
  });
  return result.data.addProxy
}
/**
  * @param {string|number} proxyID
  * @param {GraphQLClient} graphqlClient 
  * @returns {Promise<Proxy>}
  */
 async function markProxyVerified(proxyID, graphqlClient){
  let result = await graphqlClient.query({
    query:gql`
      mutation markProxyVerified($id:ID!, $timestampISO:DateTime!){
        updateProxy(filter:{id:$id}, update:{status:{verified:$timestampISO stale:false}}){
          id
        }
      }
    `,
    variables:{id: proxyID, timestampISO: new Date().toISOString()}
  });
  return result.data.updateProxy
}
/**
  * @param {string|number} proxyID
  * @param {GraphQLClient} graphqlClient 
  * @returns {Promise<Proxy>}
  */
 async function setProxyStale(proxyID, stale, graphqlClient){
  let result = await graphqlClient.query({
    query:gql`
      mutation setProxyStale($id:ID!, $stale:Boolean!){
        updateProxy(filter:{id:$id}, update:{status:{stale:$stale}}){
          id
          status{ stale }
        }
      }
    `,
    variables:{id: proxyID, stale}
  });
  return result.data.updateProxy
}
 /**
  * @param {Proxy} proxy 
  * @param {GraphQLClient} graphqlClient 
  * @returns {Promise<Proxy>}
  */
async function checkExisting(proxy, graphqlClient){
  let result = await graphqlClient.query({
    query:gql`
      query ($filter:ProxyFilter){
        proxy( filter:$filter ){
          id
          host
          port
          area
        }
      }
    `, 
    variables:{filter:proxy}
  });
  return result.data.proxy
}

module.exports.testProxies = async (options)=>{
  //create streams for outputting JSON data
  let sucessfulObjectStream = JSONStream.stringify();
  let sucessfulOutputStream = fs.createWriteStream(path.join(options.outputDirPath,'successful.json'));
  sucessfulObjectStream.pipe(sucessfulOutputStream);
  let existingObjectStream = JSONStream.stringify();
  let existingOutputStream = fs.createWriteStream(path.join(options.outputDirPath,'existing.json'));
  existingObjectStream.pipe(existingOutputStream);
  let failedObjectStream = JSONStream.stringify();
  let failedOutputStream = fs.createWriteStream(path.join(options.outputDirPath,'failed.json'));
  failedObjectStream.pipe(failedOutputStream);

  let basicAuthToken = Buffer.from(options.authUsername+':'+options.authPassword).toString('base64');
  let graphqlClient = new GraphQLClient(options.database, basicAuthToken);
  for (let proxy of options.proxyList){
      let existingProxy = await checkExisting(proxy, graphqlClient);
      //if an existing proxy is found, move on to the next proxy in the list
      if(existingProxy){ 
        logger.info(`Existing proxy connection with host:${proxy.host} and port:${proxy.port} and id:${existingProxy.id}`);
        existingObjectStream.write(existingProxy);
        if(!options.testExisting)
          continue;
      }
      //otherwise test the proxy
      const info = {
        host: proxy.host,
        port: proxy.port,
        userId: proxy.username,
        password: proxy.password
      }

      await this.getIP(info).then(async ip=>{
        if (ip==options.realIP)
          throw Error('Proxied IP matched the real IP.')
        logger.info(`Successful proxy connection with host:${proxy.host} and port:${proxy.port} and ip:${ip}`);
        proxy.ip=ip;
        if(!existingProxy){ //save new proxy
          let savedProxy = await saveProxy(proxy, graphqlClient);
          sucessfulObjectStream.write(savedProxy);
        }         
        else { //mark existing proxy verified
          let verifiedProxy = await markProxyVerified(existingProxy.id, graphqlClient);
        }
        logger.info(`Waiting ${options.timeoutBtwnTests} ms before trying next connection.`);
        await new Promise((resolve,reject)=>setTimeout(resolve, options.timeoutBtwnTests));
      }).catch(async err=>{
        logger.info(`Failed proxy connection with host:${proxy.host} and port:${proxy.port} and reason:${err}`);
        logger.error(err.stack);
        proxy.username="*****";
        proxy.password="*****";
        if(existingProxy)
          await setProxyStale(existingProxy.id, true, graphqlClient);
        failedObjectStream.write(proxy);
      });
  }
  sucessfulObjectStream.end();
  existingObjectStream.end();
  failedObjectStream.end();
}

module.exports.getIP = function(info, timeout) {
  return new Promise((resolve, reject) => {
    const agent = info ? new SocksProxyAgent(info) : null;
    let request = https.get('https://jsonip.org', {agent, timeout}, (res)=>{
      let body='';
      res.on("data", function(chunk) {
        body+=chunk;
      });
      res.on('end', ()=>{
        resolve(JSON.parse(body).ip);
      });
      res.on('error', err=>{reject(err)});
      res.on('timeout', err=>{
        // @ts-ignore
        res.abort();
        reject(err);
      })
    });
  request.on('error', err=>reject(err));
  })
}

module.exports.nordFullProxyList = async function(proxyParams) {
  let proxies = [];
  // @ts-ignore
  let nordSourceScrape = await axios.get(proxyParams.url)
  const $ = cheerio.load(nordSourceScrape.data);

  $('ul.List--custom>li span').each( function() {
    let hostname = $(this).html();
    if(proxyParams.hostnameSelector.exec(hostname))
      proxies.push(
        {
          host: hostname,
          port: proxyParams.port,
          area: hostname.substring(0,2),
          username: proxyParams.username,
          password: proxyParams.password
        }
      )
  });
  return proxies;

  // return [
  //   {
  //     host: 'us3300.nordvpn.com',
  //     port: 1080,
  //     username: 'n.novak360@gmail.com',
  //     password: 'Evilsausage1'
  //   },
  //   {
  //     host: 'us3546.nordvpn.com',
  //     port: 1080,
  //     username: 'n.novak360@gmail.com',
  //     password: 'Evilsausage1'
  //   },
  //   {
  //     host: 'us3535.nordvpn.com',
  //     port: 1080,
  //     username: 'n.novsk360@gmail.com',
  //     password: 'Evilsausage1'
  //   },
  // ]
}

module.exports.gqlFullProxyList = async function(proxyParams){
  let basicAuthToken = Buffer.from(proxyParams.authUsername+':'+proxyParams.authPassword).toString('base64');
  let graphqlClient = new GraphQLClient(proxyParams.database, basicAuthToken);
  let result = await graphqlClient.query({query:gql`
    {
      proxies{
        host
        port
        area
        username
        password
      }
    }
  `});
  result.data.proxies.forEach(proxy=>{
    delete proxy.__typename;
  })
  return result.data.proxies;
}

module.exports.gqlProxyList = async function(proxyParams){
  let basicAuthToken = Buffer.from(proxyParams.authUsername+':'+proxyParams.authPassword).toString('base64');
  let graphqlClient = new GraphQLClient(proxyParams.database, basicAuthToken);
  let result = await graphqlClient.query({query:gql`
    query ($stale:Boolean){
      proxies(filter:{status:{stale:$stale}}){
        host
        port
        area
        username
        password
      }
    }
  `, variables:{stale:proxyParams.stale}});
  result.data.proxies.forEach(proxy=>{
    delete proxy.__typename;
  })
  return result.data.proxies;
}