//@ts-check
const assert = require('assert');
const { Requirement, SkillRequirement } = require('models/Requirement');
const { Task } = require('models/Task');
const { Script } = require('models/Script');

// @ts-ignore
describe('Testing Requirements (direct database)', function(){

  // @ts-ignore
  let account;

  // @ts-ignore
  before(async function(){
    // delete all records
    await Requirement.deleteMany({});
    await Task.deleteMany({});
    await Script.deleteMany({});
  });

  let taskID;
  // @ts-ignore
  it('Adds a Task to the database for training attack', async function(){
    let task = new Task({
      name: "train attack",
      description: "test"
    });
    taskID = await task.save();
  });

  // @ts-ignore
  it ('Adds a script to the databse that accomplishes training attack', async function(){
    let script = new Script({
      version: 'v1',
      name: 'Cow Killer',
      description: 'kills cows',
      "metadata.theoreticalPPH": {
        xp: {attack: 30000 },
        gp: 12000
      },
      taskIDs: [taskID]
    });
    await script.save();
  });

  let atkreq60;
  // @ts-ignore
  it('Adds a SkillRequirement for 60 attack', async function(){
    let requirement = new SkillRequirement({
      name: "60 attack",
      description: "test",
      skill: 'attack',
      target_xp: 273742, //273742 xp is level 60
      taskIDs: [taskID]
    });
    atkreq60 = await requirement.save();
    // console.log(record)
  });

  // @ts-ignore
  it('Adds a top-level requirement', async function(){
    let requirement = new Requirement({
      name: "Wield Dragon scimi",
      description: "test",
      requirementIDs: [atkreq60._id]
    });

    let record = await requirement.save();

    // console.log(record);
  });

});