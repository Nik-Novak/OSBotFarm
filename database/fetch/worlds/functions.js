//@ts-check
const axios = require('axios');
const cheerio = require('cheerio');

const { gql } = require('apollo-boost');
const { logger } = require('./logger');
const { GraphQLClient } = require('graphql-client');

//queries
//@ts-ignore
const { getWorld, addWorld } = require('./queries/World.graphql');
//@ts-ignore
const { getTotalLevelRequirement, addTotalLevelRequirement } = require('./queries/Requirement.graphql');


/**
  * @param {GraphQLClient} graphqlClient 
  * @returns {Promise<Proxy>}
  */
 async function saveWorld(world, graphqlClient){
  let result = await graphqlClient.query({
    query:addWorld,
    variables:{world}
  });
  return result.data.addProxy
}
 /**
  * @param {GraphQLClient} graphqlClient 
  * @returns {Promise<Proxy>}
  */
async function checkExistingWorld(world, graphqlClient){
  let result = await graphqlClient.query({
    query:gql`query getWorld($filter:WorldFilter){
      world(filter:$filter){
        world
      }
    }`, 
    variables:{filter:world}
  });
  return result.data.world
}

/**
 * 
 * @param {Number} target 
 * @param {GraphQLClient} graphqlClient 
 * @returns {Promise<String>}
 */
async function getExistingOrCreateNewRequirement(target, graphqlClient){
  let result = await graphqlClient.query({
    query:getTotalLevelRequirement,
    variables:{ target }
  });
  if(result.data.requirement)
    return result.data.requirement.id; //found an existing requirement
  result = await graphqlClient.query({
    query:addTotalLevelRequirement,
    variables: { 
      name:`total_level_${target}`, 
      description: `A total level requirement of ${target} in all skills`,
      target
    }
  })
  return result.data.addTotalRequirement.id
}

module.exports.createAndSaveWorlds = async function(options){
  let basicAuthToken = Buffer.from(options.authUsername+':'+options.authPassword).toString('base64');
  let graphqlClient = new GraphQLClient(options.database, basicAuthToken);
  for (let world of options.worldList){
    console.log('processing:',world)
    let existingWorld = await checkExistingWorld(world, graphqlClient);
    //if an existing world is found, move on to the next world in the list
    if(existingWorld){ 
      logger.info(`Existing world:${world.world}`);
      continue;
    }
    let worldCopy = {...world};
    if(world.activity && world.activity.includes('skill total')){ //total level requirement detected
      let target = parseInt(world.activity.split(' ')[0]);
      let requirement = await getExistingOrCreateNewRequirement(target, graphqlClient);
      worldCopy.requirementIDs = [requirement];
    }
    console.log('WORLD', worldCopy);
    saveWorld(worldCopy, graphqlClient);
  }
}

module.exports.parseTable = async function(params) {
  let rows = [];
  // @ts-ignore
  let sourceScrape = await axios.get(params.url)
  const $ = cheerio.load(sourceScrape.data);

  $(params.rowSelector).each( function() {
    let $row = $(this);
    let $columnsOfRow = $row.children('td');
    let builtRowObj = {};
    for(let i=0; i<params.columns.length; i++){
      let column = params.columns[i];
      let columnIndex = params.columns[i].columnIndex || i
      let columnContent = $($columnsOfRow[columnIndex]).html().trim();
      builtRowObj[column.name] = column.parser(columnContent, $, $.html($columnsOfRow[columnIndex]), $.html(this)); //calls uer defined parser with column content, cheerio operator, columnSource, rowSource
    }
    if(builtRowObj[params.columns[0].name] == null)
      return;
    rows.push(builtRowObj);
  });
  return rows;
}