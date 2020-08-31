//@ts-check
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const Cryptr = require('cryptr');
// const JSONfn = require('json-fn');

// const cryptr = new Cryptr('thisisasecret');

module.exports.Integer = {
  //standard int
  type: Number,
  validate:{
    validator: Number.isInteger,
    message: '{VALUE} is not an integer'
  },
  //positive int
  Positive: {
    type: Number,
    validate:{
      validator: value => Number.isInteger(value) && value>=0,
      message: '{VALUE} is not a positive integer'
    }
  }
}

/**
 * Creates default and requirement properties based on path selectors and the options object passed. Automatically performs null checks for convenience.
 * @param {*} defaultOptionsPathSelector 
 * @param {*} requiredOptionsPathSelector 
 * @param {*} options 
 */
function createDefaultAndRequiredProperties(defaultOptionsPathSelector, requiredOptionsPathSelector, options){
  //default
  let nestedPathsStack = defaultOptionsPathSelector.split('.').reverse();
  let defaultProperty;
  defaultProperty = walkObject(nestedPathsStack, options)
  //required
  nestedPathsStack = requiredOptionsPathSelector.split('.').reverse();
  let requiredProperty;
  requiredProperty = walkObject(nestedPathsStack, options)

  return { default: defaultProperty, required: requiredProperty };
}
function walkObject(nestedPathsStack, obj){
  if(obj===undefined)
    return undefined;
  let path = nestedPathsStack.pop();
  let nestedItem = obj[path];
  if(nestedPathsStack.length === 0 ) 
    return nestedItem
  else
    return walkObject(nestedPathsStack, nestedItem);
}

module.exports.PositionSchema = (options)=>{
  return {
    x: { ...this.Integer, ...createDefaultAndRequiredProperties('default.x', 'required.x', options) },
    y: { ...this.Integer, ...createDefaultAndRequiredProperties('default.y', 'required.y', options) },
    z: { ...this.Integer, ...createDefaultAndRequiredProperties('default.z', 'required.z', options) },
    grid: { ...this.Integer, ...createDefaultAndRequiredProperties('default.grid', 'required.grid', options) }
  }
}
module.exports.Skill = { 
  type:String, enum:['attack', 'strength', 'defence', 'ranged', 'prayer', 'magic', 'runecrafting', 'construction', 'hitpoints', 'agility', 'herblore', 'thieving', 'crafting', 'fletching', 'slayer', 'hunter', 'mining', 'smithing', 'fishing', 'cooking', 'firemaking', 'woodcutting', 'farming'] 
}

module.exports.Icon = {
  type: String,
  validate:{
    validator: value => /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/.exec(value)!=null,
    message: '{VALUE} is not a valid base64'
  }
};

module.exports.Email = {
  type: String,
  validate:{
    validator: value=>/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.exec(value),
    message: '{VALUE} is not of valid email format.'
  }
}

module.exports.GameclientID = {
  type: Number,
  validate:{
    validator: value => {return Number.isInteger(value) && 30000<=value && value<=32767 },
    message: '{VALUE} must be an integer between 30000 and 32767 inclusive'
  }
}


module.exports.StatsSchema = {
  attack:       {...this.Integer.Positive, default: 0},
  strength:     {...this.Integer.Positive, default: 0},
  defense:      {...this.Integer.Positive, default: 0},
  range:        {...this.Integer.Positive, default: 0},
  prayer:       {...this.Integer.Positive, default: 0},
  magic:        {...this.Integer.Positive, default: 0},
  runecrafting: {...this.Integer.Positive, default: 0},
  construction: {...this.Integer.Positive, default: 0},
  hitpoints:    {...this.Integer.Positive, default: 0},
  agility:      {...this.Integer.Positive, default: 0},
  herblore:     {...this.Integer.Positive, default: 0},
  thieving:     {...this.Integer.Positive, default: 0},
  crafting:     {...this.Integer.Positive, default: 0},
  fletching:    {...this.Integer.Positive, default: 0},
  slayer:       {...this.Integer.Positive, default: 0},
  hunter:       {...this.Integer.Positive, default: 0},
  mining:       {...this.Integer.Positive, default: 0},
  smithing:     {...this.Integer.Positive, default: 0},
  fishing:      {...this.Integer.Positive, default: 0},
  cooking:      {...this.Integer.Positive, default: 0},
  firemaking:   {...this.Integer.Positive, default: 0},
  woodcutting:   {...this.Integer.Positive, default: 0},
  farming:      {...this.Integer.Positive, default: 0},
}

module.exports.Keybinding = {
  type: String,
  enum: ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f10', 'f11', 'f12', 'esc', 'none']
}

/**
 * Returns the object structure for defining an ObjectId that must already exist in the database.
 * @param {mongoose.Model | string} dbCollection Either the mongoose.Model, or lowercase plural string name of the collection to validate against for valid IDs. The string option is provided in the case of circular dependencies and defaults to mongodb query drivers.
 * @returns {Object} Object definition for representing an ObjectId
 */
module.exports.ExistingID = function(dbCollection){
  let collectionName = (typeof dbCollection === 'string' ? dbCollection : dbCollection.modelName);
  return {
            // @ts-ignore
            type: mongoose.ObjectId, //mongoose.ObjectId
            ref: collectionName,
            validate: {
              validator: value => { 
                return ( 
                  typeof dbCollection==='string' ? 
                    mongoose.connection.db.collection(collectionName).findOne(mongoose.Types.ObjectId(value)) : //if string is passed, use native mongo drivers to search collection by string name in case of circular dependencies
                    dbCollection.findById(value) //otherwise just use the model that was passed in //TODO Switch to .exists for better performance
                )
              },
              message: `{VALUE} must match the ID of an existing document in the ${collectionName} collection.`
            }
          }
}

/**
 * @param {object | mongoose.Schema} customIDSchema Schema of the custom ID we want to represent.
 * @param {string} idFieldName String name of the field of the ID in the database. This is used for querying the field that stores the value of the ID.
 * @param {mongoose.Model} dbCollection Either the mongoose.Model that contains the Documents we're querying against to see if it exists.
 */
module.exports.ExistingCustomID = function( customIDSchema, idFieldName, dbCollection ){
  return { 
    ...customIDSchema, 
    required:true,
    validate: {
      validator: value => {
        let fieldFilter = {}; fieldFilter[idFieldName]=value;
        return dbCollection.exists(fieldFilter)
      },
      message: `{VALUE} must match the ${idFieldName} of an existing document in the ${dbCollection.modelName} collection.`
    }
  }
}

let ReportSchema = {
  reporting_account:  { ...this.ExistingID('Account'), required:true },
  date:               Date,
}
module.exports.ReportingSchema = {
  number:             { ...this.Integer.Positive, default:0 },
  last:               ReportSchema,
}

/**
 * @typedef {Object} IQPairOptions
 * @property {boolean} [strictStacking]
 * @property {string[]} [requiredFieldFlags] The fields required to be of truthy value on the Item. Example: ['equipment|weapon', 'members']
 */
/**
 * 
 * @param {mongoose.Model} ItemModel the ItemModel to perform validation from
 * @param {IQPairOptions} [options]
 */
module.exports.ContainerItem = (ItemModel, options)=>{
  return {
    // type: {
      itemID: { ...this.ExistingCustomID( this.Integer.Positive, 'itemID', ItemModel ), required:true },
      slot: { ...this.Integer.Positive, required:true },
      quantity: { ...this.Integer.Positive, default:1,
      validate: [
        {
          validator: async function() { //stacking
            if(!options || !options.strictStacking || this.quantity===1)
            return true;
            let item = await ItemModel.findOne({itemID:this.itemID});
            if(item.stackable || item.noted)
              return true;
            return false;
          },
          message: props=>`quantity:${props.value} this item was supplied with a quantity greater than 1, but the item was found to be neither stackable nor noted. Ensure only stackable or noted items have quantity > 1`
        },
        {
          validator: async function() { //requiredFields
            if(!options || !options.requiredFieldFlags)
              return true;
            let item = await ItemModel.findOne({itemID:this.itemID});
            let valid = true; //valid by default
            options.requiredFieldFlags.forEach(requiredFieldFlag=>{ //for every requiredFieldFlag provided
              if(requiredFieldFlag.includes('|')){ //parses OR required fields such as 'equipment|weapon'
                let optionalValid=false;
                requiredFieldFlag.split('|').forEach(oneOfRequiredField=>{ 
                  if(item[oneOfRequiredField.trim()]){
                    optionalValid=true; //optionalValid becomes true if any of the optional fields are true
                    return;
                  }
                });
              valid = optionalValid; //assign optional result to overall validity
            }
            else if(!item[requiredFieldFlag.trim()]){ // parses required fields without OR such as 'members'
              valid=false;
              return;
            }
            });
            return valid;
          },
          message: props=>`This item did not have truthy values for the required fields: ${options.requiredFieldFlags}`
        },
        {
          validator: value => { //quantity
            if(value<=0)
            return false;
          },
          message: props=>`${props.value} Quantity cannot be 0 or less.`
        },
      ]
      },
    // },
    // validate: [
    //   {
    //     validator: async value => { //stacking
    //       if(!strictStacking || value.quantity===1)
    //        return true;
    //       let item = await ItemModel.findOne({itemID:value.itemID});
    //       if(!item.stackable)
    //         return false;
    //     },
    //     message: props=>`${props.value} this item was supplied with a quantity larger than 1, but the item was found to not be stackable. Ensure only stackable items have quantity > 1`
    //   },
    //   {
    //     validator: value => { //quantity
    //       if(value.quantity<=0)
    //        return false;
    //     },
    //     message: props=>`${props.value} Quantity cannot be 0 or less.`
    //   },
    // ]
  }
}
/**
 * 
 * @param {*} ContainerItemPair The pair consisting of the identifier of the element this container will store, as well as the quantity it will store
 * @param {*} maxLength The max length of this container, or how many items it can store. -1 means no limit Note: validation this will not factor items that are stackable, so it is possible to over-commit this container. Place each item with quantity:1 to avoid this
 */
module.exports.Container = function(ContainerItemPair, maxLength){
  return {
    type:[ContainerItemPair], 
    default:[],
    validate: {
      validator: value => maxLength==-1 || value.length <= maxLength, //TODO potentially add stackable item support
      message: props=>`${props.value} This container can only store a maximum of ${maxLength} items. The above supplied list was too large with length ${props.value.length}.`
    }
  }
}

// module.exports.Function = {
//   type: String,
//   validate: {
//     validator: value => (typeof JSONfn.parse(cryptr.decrypt(value)) === 'function'),
//     message: `{VALUE} must be a function.`
//   },
//   set: value => {return cryptr.encrypt(JSONfn.stringify(value))},
//   get: value => {return JSONfn.parse(cryptr.decrypt(value))}
// }