//@ts-check
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { Integer, Keybinding, ExistingID, ExistingCustomID, GameclientID, Container, ContainerItem, PositionSchema } = require('./_shared/schemas');
const { Gameclient } = require('./Gameclient');
const { Email } = require('./Email');
const { Item, EquipmentItem} = require('./Item');
const { AccountProfile } = require('./AccountProfile');

const SettingsSchema = {
  general: {
    acceptAid: {type: Boolean, default: false}
  },
  display: {
    mouseWheelZooming: {type: Boolean, default: true},
    zoomLevel: {...Integer.Positive, default: 3},
    brightness: {...Integer.Positive, default: 3},
    resizeMode: {type: Boolean, default: false},
    advanced: {
      chatBoxScrollBar: {type: Boolean, default: false},
      transparentSidePanel: {type: Boolean, default: false},
      remainingXPToolTips: {type: Boolean, default: true},
      prayerToolTips: {type: Boolean, default: true},
      specialAttackToolTips: {type: Boolean, default: true},
      roofRemoval: {type: Boolean, default: false},
      dataOrbs: {type: Boolean, default: true},
      wikiEntityLookup: {type: Boolean, default: true},
      resizeableChatBox: {type: Boolean, default: false},
      sidePanels: {type: Boolean, default: true},
    }
  },
  sound: {
    musicVolume: { ...Integer.Positive, default: 3 }, //[1-5]
    soundEffectVolume: { ...Integer.Positive, default: 5 }, //[1-5]
    areaSoundVolume: { ...Integer.Positive, default: 5 },
    musicUnlockMessage: { type: Boolean, default:true },
  },
  chat: {
    chatEffects: { type: Boolean, default:true },
    splitPrivateChat: { type: Boolean, default:false },
    hidePrivateChat: { type: Boolean, default:false },
    profanityFilter: { type: Boolean, default:true },
    notifications:{
      lootDropNotifications: { ...Integer, default: -1 }, //gp value needed to notify in chat, defaults to off
      untradeableLootNotifications: { type: Boolean, default: false },
      bossKillCountUpdatesFiltered: { type: Boolean, default: false },
      dropItemWarnings: { ...Integer, default: 30000 },
      loginLogoutNotificationTimeout: { type: Boolean, default: true },
    }
  },
  controls: {
    mouseButtons: { ...Integer, default: 2}, //number of mouse buttons: [0-2]
    middleMouseCamera: { type: Boolean, default: true },
    followerOptionsPriority: { type: Boolean, default: false },
    shiftClickToDrop: { type: Boolean, default: false },
    keybindings: {
      combat: { ...Keybinding, default: 'f1' },
      stats: { ...Keybinding, default: 'f2' },
      quests: { ...Keybinding, default: 'f3' },
      inventory: { ...Keybinding, default: 'esc' },
      equipment: { ...Keybinding, default: 'f4' },
      prayer: { ...Keybinding, default: 'f5' },
      magic: { ...Keybinding, default: 'f6' },
      friendsList: { ...Keybinding, default: 'f8' },
      accountManagement: { ...Keybinding, default: 'f9' },
      logOut: { ...Keybinding, default: 'none' },
      options: { ...Keybinding, default: 'f10' },
      emotes: { ...Keybinding, default: 'f11' },
      clanChat: { ...Keybinding, default: 'f7' },
      musicPlayer: { ...Keybinding, default: 'f12' },
      escClosesCurrentInterface: { type: Boolean, default:false }
    },
    playerAttackOptions: { type: String, enum: ['dependsOnCombatLevel', 'alwaysRightClick', 'leftClickWhereAvailable', 'hidden'], default: 'dependsOnCombatLevel' },
    npcAttackOptions: { type: String, enum: ['dependsOnCombatLevel', 'alwaysRightClick', 'leftClickWhereAvailable', 'hidden'], default: 'dependsOnCombatLevel' }
  }
}

const PrayerSchema = {
  preserve: {type: Boolean, default: false},
  chivalry: {type: Boolean, default: false},
  piety: {type: Boolean, default: false},
  rigour: {type: Boolean, default: false},
  augury: {type: Boolean, default: false}
}

const XPSchema = {
  attack:       {...Integer.Positive, default: 0},
  strength:     {...Integer.Positive, default: 0},
  defense:      {...Integer.Positive, default: 0},
  range:        {...Integer.Positive, default: 0},
  prayer:       {...Integer.Positive, default: 0},
  magic:        {...Integer.Positive, default: 0},
  runecrafting: {...Integer.Positive, default: 0},
  construction: {...Integer.Positive, default: 0},
  hitpoints:    {...Integer.Positive, default: 1154},
  agility:      {...Integer.Positive, default: 0},
  herblore:     {...Integer.Positive, default: 0},
  thieving:     {...Integer.Positive, default: 0},
  crafting:     {...Integer.Positive, default: 0},
  fletching:    {...Integer.Positive, default: 0},
  slayer:       {...Integer.Positive, default: 0},
  hunter:       {...Integer.Positive, default: 0},
  mining:       {...Integer.Positive, default: 0},
  smithing:     {...Integer.Positive, default: 0},
  fishing:      {...Integer.Positive, default: 0},
  cooking:      {...Integer.Positive, default: 0},
  firemaking:   {...Integer.Positive, default: 0},
  woodcutting:  {...Integer.Positive, default: 0},
  farming:      {...Integer.Positive, default: 0},
}

const Nameschema = { 
  type:String, 
  // @ts-ignore
  validate: {
    validator: value => /^[0-9A-Za-z _]{1,12}$/.exec(value),
    message: '{VALUE} must be alphanumeric and 1-12 characters long.'
  },
}

const StatusSchema = {
  banned: { type:Boolean, default:false },
  locked: { type:Boolean, default:false }
}

const AccountSchema = new Schema(
  {
    username:   { type:String, required:true },
    password:   { type:String, required:true, maxlength:20 },
    otp_key:    String,
    // @ts-ignore
    name:       Nameschema,
    emailID:      { ...ExistingID(Email), required:true },
    creation:   { type:Date, default:Date.now },
    status:     StatusSchema,
    position:   PositionSchema( { default:{x:0, y:0, z:0, grid:0} } ),
    profileID:    { ...ExistingID(AccountProfile) },
    xp:         { type:XPSchema, required:true },
    prayers:    { type:PrayerSchema, required:true },
    inventory:  Container( ContainerItem(Item, {strictStacking:true}), 28), //TODO improve validation
    equipment:  Container( ContainerItem(Item, {strictStacking:true, requiredFieldFlags:['equipment|weapon'] }), 11), //TODO improve validation
    bank:       Container( ContainerItem(Item), -1), //-1 is no limit  //TODO improve validation
    preferredGameclientIDs: {
      type:[ExistingCustomID( GameclientID, 'gameclientID', Gameclient )],
      required:true, 
      validate:{
        validator: value=>value.length>0,
        message: 'Must provide atleast one preferredGameclient'
      }},
    settings: SettingsSchema,
    configs: { type:[Integer] },
    log: { type:[String], default:[] },

    breaking_until: Integer //SUBJECT TO CHANGE
  }
);

AccountSchema.index({username: 1}, {unique: true});

const Account = mongoose.model('Account', AccountSchema); //any time Account is created, it will be in the 'account' collection and based on AccountSchema

module.exports = { Account }