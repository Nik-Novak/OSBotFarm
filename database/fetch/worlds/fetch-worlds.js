//@ts-check
const { parseTable, createAndSaveWorlds } = require('./functions');
const { logger } = require('./logger');
//TODO: push proxylsit to graphql



async function fetch( options ){

  let worldList;

  switch(options.url.split('?')[0]){
    case 'https://oldschool.runescape.wiki/w/Server':
      worldList = await parseTable(
        {
          url: options.url,
          rowSelector: '#mw-content-text > div > table:nth-child(8) > tbody > tr',
          columns: 
          [
            { 
              name:'world', 
              parser:(columnContent)=>columnContent && parseInt(columnContent.trim())
            },
            { 
              name:'location', 
              parser:(columnContent, $)=>{
                if(columnContent==null)
                  return null;
                switch($(columnContent).text().trim()){
                  case 'United States (east)': return 'us'
                  case 'United States (west)': return 'us'
                  case 'United Kingdom': return 'uk'
                  case 'Germany': return 'de'
                  case 'Australia': return 'au'
                }
              }
            },
            { 
              name:'kind', 
              parser:(columnContent, $)=>{
                if(columnContent==null)
                  return null;
                switch($(columnContent).attr('title').trim()){
                  case 'Free-to-play': return 'f2p';
                  case 'Members': return 'members';
                  case 'Player-versus player': return 'pvp';
                  case 'Deadman Mode': return 'dmm';
                  case 'Twisted League': return 'twisted_league';
                  case 'Tournament world': return 'tournament';
                }
              }
            },
            { 
              name:'activity', 
              parser:(columnContent, $)=>{
                let text = columnContent&&columnContent.trim();
                if(text===null)
                  return null;
                else if(text==='')
                  return undefined;
                else
                  return text;
              }
            },
          ],
        });
        break;
    case 'https://oldschool.runescape.com/slu':
      worldList = await parseTable(
        {
          url: options.url,
          rowSelector: '#os-slu main table > tbody > tr',
          columns: 
          [
            { 
              name:'world',
              columnIndex: 0, 
              parser:(columnContent, $)=>{
                let processedContent = columnContent && ($(columnContent).text().split(' '));
                let world = parseInt(processedContent[processedContent.length-1]) + 300;
                return world;
              }
            },
            { 
              name:'location',
              columnIndex: 2,
              parser:(columnContent, $)=>{
                switch(columnContent){
                  case 'United States': return 'us'
                  case 'United Kingdom': return 'uk'
                  case 'Germany': return 'de'
                  case 'Australia': return 'au'
                  default: throw Error('Unknown location')
                }
              }
            },
            { 
              name:'members',
              columnIndex: 3,
              parser:(columnContent, $, columnSource, rowSource)=>{
                switch(columnContent){
                  case 'Members': return true;
                  case 'Free': return false;
                  default: throw Error('Could not determine if world was members or not')
                }
              }
            },
            { 
              name:'kind',
              columnIndex: 4,
              parser:(columnContent, $, columnSource, rowSource)=>{
                let activity = columnContent.toLowerCase();
                if(rowSource.toString().toLowerCase().includes('pvp')) //extra safety
                  return 'pvp';
                else if(activity.includes('deadman'))
                  return 'dmm'
                else if(activity.includes('twisted league'))
                  return 'twisted_league'
                else if(activity.includes('beta') || activity.includes('tournament'))
                  return 'beta'
                else
                  return 'regular'
              }
            },
            { 
              name:'activity',
              columnIndex: 4,
              parser:(columnContent, $)=>{
                let text = columnContent&&columnContent.trim();
                if(text==='-')
                  return undefined;
                else
                  return text;
              }
            },
          ],
        });
        break;
      default:
        throw Error('Unsupported URL provided. Contact administrator to add support for this URL.')
  }

  await createAndSaveWorlds(
    {
      worldList,
      database:options.database, 
      authUsername: options.authUsername,
      authPassword: options.authPassword,
      outputDirPath: options.outputDirPath
    }
  );

  logger.info('COMPLETE Full world fetch was completed.')
}

module.exports = { fetch };