//@ts-check
const path = require('path');
const FetchItems = require('./items/fetch-items');
const FetchProxies = require('./proxies/fetch-proxies');
const FetchWorlds = require('./worlds/fetch-worlds');
const models = require('models');

if(!process.argv[2]){ //no command-line argument
    console.log("Must provide  resource to fetch. Example: npm run fetch -- items OR npm run fetch -- proxies");
    process.exit(1);
}
if(!process.argv[3]){ //no command-line argument
    console.log("Must provide a database to store to. Example: npm run fetch -- items test OR npm run fetch -- proxies production");
    process.exit(1);
}

let gqlURL, mongoURL;

switch(process.argv[3]){
  case 'test':
    gqlURL = 'https://graphql.osrsmillionaires.tk/test'
    mongoURL = 'mongodb://root:test123@localhost:27017/test?authSource=admin&w=1'
    break;
  case 'production':
    gqlURL = 'https://graphql.osrsmillionaires.tk'
    mongoURL = 'mongodb://root:test123@localhost:27017/production?authSource=admin&w=1'
    break;
  default: throw Error(`Unsupported fetch resource was provided. The following are supported: ${['test', 'production']}`)
}

switch(process.argv[2]){
  case 'items':
    let itemOptions = {
      // uri: path.join(__dirname, 'data/test.json'),
      url: 'https://www.osrsbox.com/osrsbox-db/items-complete.json',
      database: mongoURL,
      outputFilePath: path.join(__dirname, 'data/items-complete.json')
    }
    FetchItems.fetch( itemOptions );
    break;
  case 'proxies':
    let area = 'us';
    let verify=false;
    let cmd = process.argv.join(' ');
    console.log('cmd:',cmd)
    let areaArg = cmd.trim().match(/--area (.{2})/);
    if(areaArg)
      area = areaArg[1];
    let verifyArg = cmd.trim().match(/--verify/);
    if(verifyArg)
      verify = true;
    console.log('AREA: ', area)
      
    let proxyOptions = {
      // sourcing options
      url: verify ? 'verify' : 'https://nordvpn.com/ovpn/',
      proxyPort: 1080,
      area,
      proxyUsername: 'n.novak360@gmail.com',
      proxyPassword: 'Evilsausage1',
      // database options
      database: gqlURL,
      authUsername: 'client',
      authPassword: '3dnT-$CZd*l0y0zF',
      // other options
      timeoutBtwnTests: 300000, //every 5 mins check a proxy
      logPath: path.join(__dirname, 'logs/proxies.log'),
      outputDirPath: path.join(__dirname, 'data/proxies/')
    }
    FetchProxies.fetch( proxyOptions );
    break;
  case 'worlds':
    let worldOptions = {
      url: 'https://oldschool.runescape.com/slu?order=WMLPA',//url: 'https://oldschool.runescape.wiki/w/Server',
      database: gqlURL,
      authUsername: 'client',
      authPassword: '3dnT-$CZd*l0y0zF',
      outputDirPath: path.join(__dirname, 'data/worlds/')
    }
    FetchWorlds.fetch ( worldOptions );
    break;
  default: throw Error(`Unsupported fetch resource was provied. The following are supported: ${['items', 'proxies', 'worlds']}`)
}
