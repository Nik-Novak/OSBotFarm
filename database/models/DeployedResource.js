//@ts-check
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { Account }= require('./Account');
const { Gameclient }= require('./Gameclient');
const { Script }= require('./Script');
const { World }= require('./World');
const { Integer, ExistingID, GameclientID, ExistingCustomID } = require('./_shared/schemas')

const options = {discriminatorKey: '_type'};

// ###### DeployedResource ######
const DeployedMetadataSchema = {
  ready: { type:Boolean, default:false },
  created: { type:Date, default:Date.now },
  deployed: Date
}

const DeployedResourceSchema = new Schema(
  {
    metadata: DeployedMetadataSchema,
  }, options
);

const DeployedResource = mongoose.model('DeployedResource', DeployedResourceSchema);

// ###### DeployedGameclient ######
const InstalledScriptSchema = {
  name: {type: String, enum:['rubex/polyester'], default: 'rubex/polyester'},
  branch: {type: String, default:'master'}
}
const DeployedGameclientSchema = new Schema(
  {
    gameclientID: ExistingCustomID( GameclientID, 'gameclientID', Gameclient ),
    installedScript: { type:InstalledScriptSchema, required:true },
    running: { type:Boolean, default:false }
  }, options
);

DeployedGameclientSchema.index({gameclientID: 1}, {unique: true});

const DeployedGameclient = DeployedResource.discriminator('DeployedGameclient', DeployedGameclientSchema);

// ###### DeployedAccount ######
const ManagerSchema = {
  host: {type:String, required:true},
  port: {...Integer.Positive, required:true}
}
const DeployedAccountSchema = new Schema(
  {
    accountID: { ...ExistingID(Account), required:true },
    deployedGameclientID: { ...ExistingCustomID(GameclientID, 'gameclientID', DeployedGameclient), required:true },
    scriptID: { ...ExistingID(Script), required:true },
    world: { ...ExistingCustomID(Integer.Positive, 'world', World), required:true },
    manager: ManagerSchema,

    //from config, subject to change
    method: {type:String}, //subject to change and replaced by Script
    run_energy: Integer.Positive //subject to removal/change
  }, options
);

/*
const LegacyConfigInventorySchema = new Schema({
  type: {type: String},
  inventory: String
});
const LegacyConfigSchema = {
  email: { ...Email },//
  name: String,//
  password: String,//
  method: String, \\
  equipment: {type:LegacyConfigInventorySchema},//
  inventory: {type:LegacyConfigInventorySchema},//
  bank: {type:LegacyConfigInventorySchema},//
  x: {...Integer},//
  y: {...Integer},//
  banned: Boolean,//
  locked: Boolean,//
  configs: { type:[Integer] },//
  log: [String],//
  state: String,
  breakingUntil: Integer,
  proxy: String, --
  mouseHop: Boolean,//
  minReaction: Number,//
  afkAmount: Number,//
  cameraMovement: Number,//
  hoverAmount: Number,//
  multiClickChance: Number,//
  runEnergy: Number --
}
*/

DeployedAccountSchema.index({accountID: 1}, {unique: true});

const DeployedAccount = DeployedResource.discriminator('DeployedAccount', DeployedAccountSchema);

module.exports = { DeployedResource, DeployedAccount, DeployedGameclient }