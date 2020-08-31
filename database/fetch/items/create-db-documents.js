//@ts-check
const { Item, EquipmentItem, WeaponItem } = require('models/Item');
const { SkillRequirement, CombatRequirement } = require('models/Requirement');
const { LevelMap } = require('models/LevelMap');
const mongoose = require('mongoose');
const { levelToExp, expToLevel }= require('./_shared/functions');
const {Task} = require('models/Task')

function nullToUndefined(obj) {
  for (let k in obj) {
    if(obj.hasOwnProperty(k.toString())){
      if(obj[k]==null){
        obj[k]=undefined
      }
      if (typeof obj[k] === "object") {
        nullToUndefined(obj[k])
      }
    }
  }
}

/**
 * 
 * @param {Object} v value to parse and create Item from
 * @returns {Promise<mongoose.Document>}
 */
module.exports.createItem = async function (v, requirementIDs){
  
    // console.log('BASE');
    let base = {
      itemID: v.id,
      name: v.name,
      examine: v.examine,
      incomplete: v.incomplete,
      members: v.members,
      noted: v.noted,
      noteable: v.noteable,
      stacked: v.stacked, //not in docs, but in data
      stackable: v.stackable,
      weight: v.weight,
      quest_item: v.quest_item,
      release_date: v.release_date,
      trade: {
        tradeable: v.tradeable,
        tradeable_on_ge: v.tradeable_on_ge,
        buy_limit: v.buy_limit,
        store_cost: v.cost,
        lowalch: v.lowalch,
        highalch: v.highalch
      },
      linked_items: {
        itemID: v.linked_id_item,
        notedID: v.linked_id_noted,
        placeholderID: v.linked_id_placeholder
      },
      placeholder: v.placeholder,
      equipable: v.equipable,
      equipable_by_player: v.equipable_by_player,
      equipable_weapon: v.equipable_weapon,
      duplicate: v.duplicate,
      wiki_name: v.wiki_name,
      wiki_url: v.wiki_url,
      icon: v.icon
    }


  let equipment ={};
  if(v.equipable_by_player){
    // console.log('EQUIPMENT');
    equipment = {
      ...base, //inherits base
      equipment:{
        bonuses: {
          attack_stab: v.equipment.attack_stab,
          attack_slash: v.equipment.attack_slash,
          attack_crush: v.equipment.attack_crush,
          attack_magic: v.equipment.attack_magic,
          attack_ranged: v.equipment.attack_ranged,
          defence_stab: v.equipment.defence_stab,
          defence_slash: v.equipment.defence_slash,
          defence_crush: v.equipment.defence_crush,
          defence_magic: v.equipment.defence_magic,
          defence_ranged: v.equipment.defence_ranged,
          melee_strength: v.equipment.melee_strength,
          ranged_strength: v.equipment.ranged_strength,
          magic_damage: v.equipment.magic_damage,
          prayer_bonus: v.equipment.prayer
        },
        slot: v.equipment.slot,
        requirementIDs: requirementIDs
      }
    }
  }

  if(v.equipable_weapon){
    
    let weaponObj = {
      ...equipment, //inherits from equipment
      weapon:{
        attack_speed: v.weapon.attack_speed,
        type: v.weapon.weapon_type,
        stances: v.weapon.stances
      }
    }
    function convertXPToArray(stringXP){
      if(stringXP == 'shared')
        return ['attack', 'strength', 'defence'];
      else if (stringXP == 'ranged and defence')
        return ['ranged', 'defence'];
      else if (stringXP == 'magic and defence')
        return ['magic', 'defence'];
      else if (stringXP == 'none' || stringXP==null ) //Dinh's bulwark has null xp
        return [];
      else
        return [stringXP];
    }
    weaponObj.weapon.stances.forEach(stance => {
      //convert strings to arrays of stats and rename property to xp
      stance.xp = convertXPToArray(stance.experience);
      delete stance.experience; //delete old property

      //convert spaced enums to underscores and remove brackets
      if(stance.combat_style)
        stance.combat_style = stance.combat_style.replace(/ /gm,'_').replace(/\(|\)/gm,'');
      if(stance.attack_type)
        stance.attack_type = stance.attack_type.replace(/ /gm,'_');

      //convert 'none' to null
      if(stance.attack_style == 'none')
        stance.attack_style = undefined
      if(stance.attack_type == 'none')
        stance.attack_type = undefined

    })
    nullToUndefined(weaponObj);
    // console.log('WEAPON');
    return new WeaponItem(
      weaponObj
    );
  }
  else if(v.equipable_by_player){
    nullToUndefined(equipment);
    return new EquipmentItem(equipment);
  }
  else{
    nullToUndefined(base);
    return new Item(base);
  }
}


async function processCombatReq(target,requirements){
    let existing = await CombatRequirement.findOne({target});
    if(existing) //if theres an existing skill req push it on the stack
      requirements.push(existing._id)
    else //otherwise create a new skillreq
      {
        let combatreq = new CombatRequirement(
          {
            name: `${'combat'}_${target}`,
            description: `A combat requirement of level ${target}`,
            //TODO add inheriting of taskIDs from some base skillrequirement
            target
          }
        );
        requirements.push(combatreq);
      }
}

async function processSkillReq(skill, target,requirements){
  if(skill=='runecraft') //sanitizing bad input
    skill='runecrafting';
  let target_xp = await levelToExp(target, LevelMap);
    let existing = await SkillRequirement.findOne({skill, target_xp});
    if(existing) //if theres an existing skill req push it on the stack
      requirements.push(existing._id)
    else //otherwise create a new skillreq
      {
        let skillreq = new SkillRequirement(
          {
            name: `${skill}_${target}`,
            description: `A skill requirement of level ${target} in ${skill}`,
            //TODO add inheriting of taskIDs from some base skillrequirement
            skill: skill,
            target_xp
          }
        );
        requirements.push(skillreq);
      }
}
/**
 * 
 * @returns {Promise<Array<mongoose.Document|string>>} List of IDs of existing requirements, or new mongoose.Documents if none were found
 */
module.exports.createRequirements = async function (v){
  if(!(v.equipment && v.equipment.requirements)) //if requirements arent defined
    return [];
  let vEquipReqs = v.equipment.requirements;
  let requirements = [];
  let parallelTasks = Object.entries(vEquipReqs).map(async([skill,target])=>{
    if(skill=='combat')
      return processCombatReq(target, requirements);
    return processSkillReq(skill,target,requirements);
  });
  await Promise.all(parallelTasks);
  return requirements;
}