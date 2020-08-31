//@ts-check
const { transpileSchema } = require('graphql-s2s').graphqls2s;
const otpUtilities = require('otp-utilities');
const { Account } = require('models/Account');
const { AccountProfile } = require('models/AccountProfile');
const { Gameclient } = require('models/Gameclient');
const { Email } = require('models/Email');
const { Item } = require('models/Item');
const { LevelMap } = require('models/LevelMap');

const { expToLevel, flatten, renameAndFlattenFilter } = require('./_shared/functions');
const { getDocument, getDocuments, updateDocument, updateDocuments, deleteDocument, deleteDocuments } = require('./_shared/operations');
const { TLQueryOperators } = require('./_shared/transpileable-schemas');

module.exports.typeDef = `
type AccountStatus {
  banned:Boolean!
  locked:Boolean!
}
input AccountStatusInput {
  banned:Boolean!
  locked:Boolean!
}
input AccountStatusFilter {
  banned:Boolean
  locked:Boolean
}

type Position {
  x:Int!
  y:Int!
  z:Int!
  grid:Int
}
input PositionInput {
  x:Int!
  y:Int!
  z:Int!
  grid:Int
}
input PositionFilter {
  x:Int
  y:Int
  z:Int
  grid:Int
}

type Settings_general {
  acceptAid: Boolean
}
input Settings_generalInput {
  acceptAid: Boolean
}

type Settings_display_advanced {
  chatBoxScrollBar: Boolean
  transparentSidePanel: Boolean
  remainingXPToolTips: Boolean
  prayerToolTips: Boolean
  specialAttackToolTips: Boolean
  roofRemoval: Boolean
  dataOrbs: Boolean
  wikiEntityLookup: Boolean
  resizeableChatBox: Boolean
  sidePanels: Boolean
}
input Settings_display_advancedInput {
  chatBoxScrollBar: Boolean
  transparentSidePanel: Boolean
  remainingXPToolTips: Boolean
  prayerToolTips: Boolean
  specialAttackToolTips: Boolean
  roofRemoval: Boolean
  dataOrbs: Boolean
  wikiEntityLookup: Boolean
  resizeableChatBox: Boolean
  sidePanels: Boolean
}

type Settings_display {
  mouseWheelZooming: Boolean
  zoomLevel: Int
  brightness: Int
  resizeMode: Boolean
  advanced: Settings_display_advanced
}
input Settings_displayInput {
  mouseWheelZooming: Boolean
  zoomLevel: Int
  brightness: Int
  resizeMode: Boolean
  advanced: Settings_display_advancedInput
}

type Settings_sound {
  musicVolume: Int
  soundEffectVolume: Int
  areaSoundVolume: Int
  musicUnlockMessage: Boolean
}
input Settings_soundInput {
  musicVolume: Int
  soundEffectVolume: Int
  areaSoundVolume: Int
  musicUnlockMessage: Boolean
}

type Settings_chat_notifications {
  lootDropNotifications: Int
  untradeableLootNotifications: Boolean
  bossKillCountUpdatesFiltered: Boolean
  dropItemWarnings: Int
  loginLogoutNotificationTimeout: Boolean
}
input Settings_chat_notificationsInput {
  lootDropNotifications: Int
  untradeableLootNotifications: Boolean
  bossKillCountUpdatesFiltered: Boolean
  dropItemWarnings: Int
  loginLogoutNotificationTimeout: Boolean
}

type Settings_chat {
  chatEffects: Boolean
  splitPrivateChat: Boolean
  hidePrivateChat: Boolean
  profanityFilter: Boolean
  notifications: Settings_chat_notifications
}
input Settings_chatInput {
  chatEffects: Boolean
  splitPrivateChat: Boolean
  hidePrivateChat: Boolean
  profanityFilter: Boolean
  notifications: Settings_chat_notificationsInput
}

enum Keybinding {
  f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,esc,none
}

type Settings_controls_keybindings {
  combat: Keybinding
  stats: Keybinding
  quests: Keybinding
  inventory: Keybinding
  equipment: Keybinding
  prayer: Keybinding
  magic: Keybinding
  friendsList: Keybinding
  accountManagement: Keybinding
  logOut: Keybinding
  options: Keybinding
  emotes: Keybinding
  clanChat: Keybinding
  musicPlayer: Keybinding
  escClosesCurrentInterface: Keybinding
}
input Settings_controls_keybindingsInput {
  combat: Keybinding
  stats: Keybinding
  quests: Keybinding
  inventory: Keybinding
  equipment: Keybinding
  prayer: Keybinding
  magic: Keybinding
  friendsList: Keybinding
  accountManagement: Keybinding
  logOut: Keybinding
  options: Keybinding
  emotes: Keybinding
  clanChat: Keybinding
  musicPlayer: Keybinding
  escClosesCurrentInterface: Keybinding
}

enum AttackOption {
  dependsOnCombatLevel, alwaysRightClick, leftClickWhereAvailable, hidden
}

type Settings_controls {
  mouseButtons: Int
  middleMouseCamera: Boolean
  followerOptionsPriority: Boolean
  shiftClickToDrop: Boolean
  keybindings: Settings_controls_keybindings
  playerAttackOptions: AttackOption
  npcAttackOptions: AttackOption
}
input Settings_controlsInput {
  mouseButtons: Int
  middleMouseCamera: Boolean
  followerOptionsPriority: Boolean
  shiftClickToDrop: Boolean
  keybindings: Settings_controls_keybindingsInput
  playerAttackOptions: AttackOption
  npcAttackOptions: AttackOption
}

type Settings {
  general: Settings_general
  display: Settings_display
  sound: Settings_sound
  chat: Settings_chat
  controls: Settings_controls
}
input SettingsInput {
  general: Settings_generalInput
  display: Settings_displayInput
  sound: Settings_soundInput
  chat: Settings_chatInput
  controls: Settings_controlsInput
}

  type Prayers {
    preserve: Boolean!
    chivalry: Boolean!
    piety: Boolean!
    rigour: Boolean!
  }
  input PrayersInput {
    preserve: Boolean = false
    chivalry: Boolean = false
    piety: Boolean = false
    rigour: Boolean = false
  }
  input PrayersFilter {
    preserve: Boolean
    chivalry: Boolean
    piety: Boolean
    rigour: Boolean
  }
  
  input XPInput{ #Filter for this is just StatsInput
    attack: Int = 0
    strength: Int = 0
    defence: Int = 0
    ranged: Int = 0
    prayer: Int = 0
    magic: Int = 0
    runecrafting: Int = 0
    construction: Int = 0
    hitpoints: Int = 1154
    agility: Int = 0
    herblore: Int = 0
    thieving: Int = 0
    crafting: Int = 0
    fletching: Int = 0
    slayer: Int = 0
    hunter: Int = 0
    mining: Int = 0
    smithing: Int = 0
    fishing: Int = 0
    cooking: Int = 0
    firemaking: Int = 0
    woodcutting: Int = 0
    farming: Int = 0
  }

  type Account {
    id: ID!
    username: String!
    password: String!
    otp: String
    otp_key: String
    name: String
    email: Email!
    creation: DateTime!
    status: AccountStatus!
    position: Position!
    profile: AccountProfile
    xp: Stats!
    levels: Stats!
    prayers: Prayers!
    inventory:[ContainerItem]!
    equipment:[ContainerItem]!
    bank:[ContainerItem]!
    preferredGameclients:[Gameclient]!
    settings: Settings
    configs: [Int]
    log: [String]!
    breaking_until: Int # SUBJECT TO CHANGE
  }
  input AccountInput {
    username: String!
    password: String!
    otp_key: String
    name: String
    emailID: ID!
    creation: DateTime
    status: AccountStatusInput
    position: PositionInput
    profileID: ID
    xp: XPInput!
    prayers: PrayersInput!
    inventory:[ContainerItemInput]
    equipment:[ContainerItemInput]
    bank:[ContainerItemInput]
    preferredGameclientIDs: [Int]!
    settings: SettingsInput
    configs: [Int]
    log: [String]
    breaking_until: Int # SUBJECT TO CHANGE
  }
  input AccountFilter {
    _or: [AccountFilter]
    _and: [AccountFilter]
    _nor: [AccountFilter]
    id: ID
    username: String
    password: String
    otp_key: String
    name: String
    emailID: String
    creation: DateTime
    status: AccountStatusFilter
    position: PositionFilter
    profileID: ID
    xp: StatsInput
    prayers: PrayersFilter
    inventory:[ContainerItemInput]
    equipment:[ContainerItemInput]
    bank:[ContainerItemInput]
    # settings: SettingsFilter TODO
    configs: [Int]
    log: [String]
    breaking_until: Int # SUBJECT TO CHANGE
  }

  ################ Account Namespaced Mutations ################
  type AccountMutations{
    log(msg:String!):Account
  }
  ################ Root ################

  extend type Query {
    account( filter:AccountFilter, random:Boolean ): Account
    accounts( filter:AccountFilter, random:Boolean, limit:Int ): [Account]
  }

  extend type Mutation {
    # namespaced mutations
    account( filter:AccountFilter, random:Boolean ):AccountMutations
    accounts( filter:AccountFilter, random:Boolean, limit:Int ):AccountMutations

    addAccount( account:AccountInput! ): Account 
    addAccounts( accounts:[AccountInput]! ): [Account]
    updateAccount( filter:AccountFilter! update:AccountFilter! ): Account
    updateAccounts( filter:AccountFilter! update:AccountFilter! ): [Account]
    delAccount( filter:AccountFilter! ): Account
    delAccounts( filter:AccountFilter! ): [Account]
  }
`

module.exports.resolvers = {
  Account: {
    email: account=>Email.findById(account.emailID),
    levels: async account => {
      let levels = account.xp;
      for (let key in levels){
        levels[key] = await expToLevel(levels[key], LevelMap); //convert xp to levels then store in levels object
      }
      return levels;
    },
    preferredGameclients: account=>Gameclient.find({gameclientID:{$in:account.preferredGameclientIDs}}),
    profile: account=>AccountProfile.find({_id:account.profileID}),
    otp: account=>otpUtilities.generate(account.otp_key)
  },

  AccountMutations: {
    log: (account, args)=>Account.findByIdAndUpdate(account._id, { $push:{ log:args.msg } })
  },

  // ############# Root ################
  Query:{
    account: getDocument(Account),
    accounts: getDocuments(Account)
  },
  Mutation: {
    account: getDocument(Account),
    accounts: getDocuments(Account),
    addAccount: (parent, args) => {
      let account = new Account(args.account);
      return account.save();
    },
    addAccounts: (parent, args) => Account.insertMany(args.accounts),
    updateAccount: updateDocument(Account),
    updateAccounts: updateDocuments(Account),
    delAccount: deleteDocument(Account),
    delAccounts: deleteDocuments(Account),
  }
}