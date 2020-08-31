//@ts-check
const {getIP, nordFullProxyList, gqlProxyList, testProxies} = require('./functions');
const { logger } = require('./logger');
//TODO: push proxylsit to graphql



async function fetch( options ){
  const realIP = await getIP(null);

  let proxyList;

  switch(options.url){
    case 'https://nordvpn.com/ovpn/':
      proxyList = await nordFullProxyList(
        {
          url: options.url,
          hostnameSelector: new RegExp(`^${options.area}[0-9]*\.nordvpn\.com`), // /^us[0-9]*\.nordvpn\.com/, 
          port:options.proxyPort, 
          username: options.proxyUsername, 
          password:options.proxyPassword
        });
        break;
    case 'verify':
      proxyList = await gqlProxyList(
        {
          database: options.database,
          authUsername: options.authUsername,
          authPassword: options.authPassword,
          stale:true
        });
        break;
      default:
        throw Error('Unsupported URL provided. Contact administrator to add support for this URL.')
  }

  await testProxies(
    {
      proxyList,
      testExisting: true, 
      realIP, 
      database: options.database, 
      timeoutBtwnTests: options.timeoutBtwnTests,
      authUsername: options.authUsername,
      authPassword: options.authPassword,
      outputDirPath: options.outputDirPath
    }
  );

  // // ALL POSSIBLE AREA CODES
  // let areaCodeSet = new Set();
  // proxyList.forEach(proxy=>areaCodeSet.add(proxy.host.substring(0,2)));
  // console.log('AREA CODES:',areaCodeSet )
  // logger.info('COMPLETE Full proxy fetch was completed.')
}

module.exports = { fetch };