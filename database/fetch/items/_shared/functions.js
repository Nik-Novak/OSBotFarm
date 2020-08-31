//@ts-check
const mongoose = require('mongoose');
/**
 * @param {Number} exp Int exp to be mapped to a level
 * @param {mongoose.Model} levelMapDBModel
 * @returns {Promise<Number>} Level associated with the provided exp
 */
module.exports.expToLevel = async function (exp, levelMapDBModel){
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

/**
 * @param {Number} level Int level to be mapped to exp
 * @param {mongoose.Model} levelMapDBModel
 * @returns {Promise<Number>} Minimum exp required to achieve the provided level
 */
module.exports.levelToExp = async function (level, levelMapDBModel){
  let exp;
  try {
    exp = (await levelMapDBModel.findOne({level})).exp;
  } catch(err){throw Error('leveltoExp Mapping failed. Ensure levelmaps are configured properly and no negative exp numbers were provided. Error stack trace: ' + err)}
  return exp;
}

/**
 * Returns a new object with renamed root-level properties.
 * @param {String[]} currentNames list of current property names to be renamed
 * @param {String[]} newNames list of new named to be assigned, respecting original order of currentNames
 * @returns {Object} New object with renamed properties
 */
module.exports.renameProperties = function(currentNames, newNames, obj){
  let newObj = Object.assign({}, obj);
  for(let i=0; i<currentNames.length; i++)
    if(newObj[currentNames[i]]){ //if the property with current name exists
      Object.defineProperty(newObj, newNames[i], Object.getOwnPropertyDescriptor(newObj,currentNames[i])) //define a new property based on supplied newName[i]
      delete newObj[currentNames[i]]; //remove old property
    }
  return newObj;
}