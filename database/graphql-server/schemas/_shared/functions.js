//@ts-check
const axios = require('axios');
const models = require('models');
const { ObjectId } = models.Types

let expToLevel = async function (exp, levelMapDBModel){
  let level;
  try{
  level = (await levelMapDBModel.findOne({
        exp: {
          $lte: exp
        },
        $expr: {
          $gt: [
            {
              $sum: [
                "$exp",
                "$expNext"
              ]
            },
            exp
          ]
        }
      })).level;
  }catch(err){throw Error('expToLevel Mapping failed. Ensure levelmaps are configured properly and no negative exp numbers were provided. Error stack trace: ' + err)}
  return level;
}
let levelToExp = async function (level, levelMapDBModel){
  let exp;
  try{
    exp = (await levelMapDBModel.findOne({level})).exp;
  }catch(err){throw Error('leveltoExp Mapping failed. Ensure levelmaps are configured properly and no negative exp numbers were provided. Error stack trace: ' + err)}
  return exp;
}

// /**
//  * Returns a new object with renamed root-level properties.
//  * @param {String[]} currentNames list of current property names to be renamed
//  * @param {String[]} newNames list of new named to be assigned, respecting original order of currentNames
//  * @returns {Object} New object with renamed properties
//  */
// let renameProperties = function(currentNames, newNames, obj){
//   let newObj = Object.assign({}, obj);
//   for(let i=0; i<currentNames.length; i++)
//     if(newObj[currentNames[i]]){ //if the property with current name exists
//       Object.defineProperty(newObj, newNames[i], Object.getOwnPropertyDescriptor(newObj,currentNames[i])) //define a new property based on supplied newName[i]
//       delete newObj[currentNames[i]]; //remove old property
//     }
//   return newObj;
// }

let renameProperties = function(nameMap, obj){
  if(typeof obj === 'object')
    Object.entries(obj).forEach(([currentKey, value])=>{
      if(typeof value === 'object' || Array.isArray(obj))
        renameProperties(nameMap, value);
        
      if(nameMap[currentKey]!=undefined){
        Object.defineProperty(obj, nameMap[currentKey], Object.getOwnPropertyDescriptor(obj,currentKey));
        delete obj[currentKey];
      }
    });
  else if (Array.isArray(obj))
    for(let i=0; i<obj.length; i++)
      renameProperties(nameMap, obj[i])
  return obj || {};
}

let flatten = function(obj){ //TODO fix dates and other objects from being excluded from filters and updates
  let flatFilter = {};
  function fetchLeaf(currPath, obj){
    Object.entries(obj).forEach(([key, value])=>{
      let appendedPath = (currPath==="" ? key : currPath + '.'+key)
      if(typeof value == 'object' && value!=null && value.__proto__==null) //value.__proto__==null is added to ensure that an object like Date() is distinguished from an object like {} ; Removed && value.__proto__
        fetchLeaf(appendedPath, obj[key]);
      else if (typeof value == 'string' &&value.length==24 && ObjectId.isValid(value)) //nasty ObjectID non-conversion from mongoose if querying discriminator basetype
        flatFilter[appendedPath]= ObjectId(value); //TODO extensively test all types of objects
      else
        flatFilter[appendedPath]=value;
    });
  }
  fetchLeaf("", obj);
  return flatFilter;
}

let renameAndFlattenFilter = function(filter){ //TODO fix dates and other objects from being excluded from filters and updates
  let renamedFilter = renameProperties({id:'_id', type:'_type', _or:'$or', _and:'$and', _nor:'$nor'}, filter); //renameProperties(['id', 'type', '_or', '_and', '_nor'], ['_id', '_type', '$or', '$and', '$nor'], filter);
  console.log('renamedFilter', renamedFilter)
  let flatFilter = flatten(renamedFilter);
  return flatFilter
}


let generateMacAddress = function (vendor){ //TODO vendor
  return "XX:XX:XX:XX:XX:XX".replace(/X/g, function() {
    return "0123456789ABCDEF".charAt(Math.floor(Math.random() * 16))
  });
}

let generateUUID = async function(os){
  // @ts-ignore
  let UUID = (await axios.get('https://www.uuidgenerator.net/api/version4')).data.trim();
  if(os && os.includes('windows'))
    UUID = UUID.toUpperCase();
  return UUID
}

module.exports = { expToLevel, levelToExp, renameProperties, flatten, renameAndFlattenFilter, generateUUID, generateMacAddress }