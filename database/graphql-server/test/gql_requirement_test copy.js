//@ts-check
const assert = require('assert');
const models = require('models');
const config = require('config');
const { Requirement, SkillRequirement } = require('models/Requirement');
const { Task } = require('models/Task');
const { Script } = require('models/Script');

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

// @ts-ignore
describe('Testing Requirements (graphql)', function(){

  // @ts-ignore
  before(async function(){
    // delete all records
    await Requirement.deleteMany({});
    await Task.deleteMany({});
    await Script.deleteMany({});
  });
// ##################################################################
let prev_trainAttackID;
  // @ts-ignore
  it('Adds a Task to the database for training attack', async function(){
    let mutation = gql`
      mutation {
        addTask(name:"train_attack", description:"training of attack skill"){
          name
          description
        }
      }
    `
    let result = await client.mutate({mutation});
    let expected = {
      "addTask": {
        "name": "train_attack",
        "description": "training of attack skill",
        "__typename": "Task"
      }
    }
    prev_trainAttackID = (await client.query({query:gql`
      {
        task(name:"train_attack"){
          id
        }
      }
    `})).data.task.id;
    assert(JSON.stringify(result.data) === JSON.stringify(expected))
  });
// ##################################################################
  // @ts-ignore
  it ('Adds a script to the database that accomplishes training attack', async function(){
    let mutation = gql`
      mutation {
        addScript(
          version:"v1", 
          name:"Cow Killing", 
          description:"Kills cows in lumby", 
          theoretical_progressPerHour:{xp:{attack:31000}},
          taskIDs:["${prev_trainAttackID}"]
        ){
          version
          name
          description
          metadata{
            theoreticalPPH{
              xp{
                attack
                strength
              }
              gp
            }
          }
        }
      }
    `
    let result = await client.mutate({mutation});
    let expected = {
      "addScript": {
        "version": "v1",
        "name": "Cow Killing",
        "description": "Kills cows in lumby",
        "metadata": {
          "theoreticalPPH": {
            "xp": {
              "attack": 31000,
              "strength": 0,
              "__typename": "Stats"
            },
            "gp": 0,
            "__typename": "Progress"
          },
          "__typename": "ScriptMetadata"
        },
        "__typename": "Script"
      }
    }
    assert(JSON.stringify(result.data) === JSON.stringify(expected))
  });
// ##################################################################
  let prev_skillReqID;
  // @ts-ignore
  it('Adds a SkillRequirement for 60 attack, and queries it by name', async function(){
    let mutation = gql`
      mutation {
        addSkillRequirement
        (
          name: "60_attack", 
          description:"60 atk requirement",
          skill:attack, 
          target_level:60,
          taskIDs:["${prev_trainAttackID}"],
        ){
          name
          description
          skill
          xp_target:target(format:xp)
          level_target:target(format:level)
        }
      }
    `
    let result = await client.mutate({mutation});
    let expected = {
      "addSkillRequirement": {
        "name": "60_attack",
        "description": "60 atk requirement",
        "skill": "attack",
        "xp_target": 273742,
        "level_target": 60,
        "__typename": "SkillRequirement"
      }
    }
    prev_skillReqID = (await client.query({query:gql`
      {
        requirement(name:"60_attack"){
          id
        }
      }
    `})).data.requirement.id
    assert(JSON.stringify(result.data) === JSON.stringify(expected))
  });
// ##################################################################
  // @ts-ignore
  it('Adds a top-level task to wield d scim', async function(){
    let mutation = gql`
      mutation {
        addTask(name:"wield_d_scim", description:"A demo task for requirements resolving", requirementIDs:["${prev_skillReqID}"]){
          name
          description
          requirements{
            name
            description
          }
        }
      }
    `
    let result = await client.mutate({mutation});
    let expected = {
      "addTask": {
        "name": "wield_d_scim",
        "description": "A demo task for requirements resolving",
        "requirements": [
          {
            "name": "60_attack",
            "description": "60 atk requirement",
            "__typename": "SkillRequirement"
          }
        ],
        "__typename": "Task"
      }
    }
    assert(JSON.stringify(result.data) == JSON.stringify(expected))
  });

  // @ts-ignore
  it('Verifies that the entire task tree has been properly built', async function(){
    let result = await client.query({query:gql`
      {
        task(name:"wield_d_scim"){
          name
          description
          requirements{
            name
            tasks{
              name
              scripts{
                name
              }
            }
          }
        }
      }
    `});
    let expected = {
      "task": {
        "name": "wield_d_scim",
        "description": "A demo task for requirements resolving",
        "requirements": [
          {
            "name": "60_attack",
            "tasks": [
              {
                "name": "train_attack",
                "scripts": [
                  {
                    "name": "Cow Killing",
                    "__typename": "Script"
                  }
                ],
                "__typename": "Task"
              }
            ],
            "__typename": "SkillRequirement"
          }
        ],
        "__typename": "Task"
      }
    }
    assert(JSON.stringify(result.data) == JSON.stringify(expected))
  });

});