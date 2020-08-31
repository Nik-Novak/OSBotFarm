//@ts-check
const { transpileSchema } = require('graphql-s2s').graphqls2s;
const { renameProperties } = require('./_shared/functions');
const { Item } = require('models/Item');
const { Requirement } = require('models/Requirement');
const { getDocument, getDocuments, updateDocument, updateDocuments, deleteDocument, deleteDocuments } = require('./_shared/operations');
const { TLQueryOperators } = require('./_shared/transpileable-schemas');
module.exports.typeDef = transpileSchema(`

  ${TLQueryOperators}

  enum ItemType {
    Item, EquipmentItem, WeaponItem
  }

  ########### Item ###########

  type LinkedItems {
    itemID:Int
    notedID:Int
    placeholderID:Int
  }
  input LinkedItemsFilter {
    itemID:Int
    notedID:Int
    placeholderID:Int
  }

  type Trade {
    tradeable:Boolean!
    tradeable_on_ge:Boolean!
    buy_limit:Int
    store_cost:Int!
    lowalch:Int!
    highalch:Int!
  }
  input TradeFilter {
    tradeable:Boolean
    tradeable_on_ge:Boolean
    buy_limit:Int
    store_cost:Int
    lowalch:Int
    highalch:Int
  }

  interface ItemInterface {
    itemID:Int!
    name:String!
    examine:String
    incomplete:Boolean!
    members:Boolean!
    noted:Boolean!
    noteable:Boolean!
    stacked:Int
    stackable:Boolean!
    weight:Float
    quest_item:Boolean!
    release_date:DateTime
    trade:Trade!
    linked_items:LinkedItems
    placeholder:Boolean!
    equipable:Boolean!
    equipable_by_player:Boolean!
    equipable_weapon:Boolean!
    duplicate:Boolean!
    wiki_name:String
    wiki_url:String
    icon:String
  }
  type Item inherits ItemInterface implements ItemInterface{
  }
  input ItemFilter {
    type:ItemType
    itemID:Int
    name:String
    examine:String
    incomplete:Boolean
    members:Boolean
    noted:Boolean
    noteable:Boolean
    stacked:Int
    stackable:Boolean
    weight:Float
    quest_item:Boolean
    release_Date:DateTime
    trade:TradeFilter
    linked_items:LinkedItemsFilter
    placeholder:Boolean
    equipable:Boolean
    equipable_by_player:Boolean
    equipable_weapon:Boolean
    duplicate:Boolean
    wiki_name:String
    wiki_url:String
    icon:String
  }

  ########### EquipmentItem ###########

  enum EquipmentSlot {
    head,neck,cape,ammo,body,weapon,shield,legs,feet,hands,ring,_2h
  }

  type EquipmentBonus {
    attack_stab:Int
    attack_slash:Int
    attack_crush:Int
    attack_magic:Int
    attack_ranged:Int
    defense_stab:Int
    defense_slash:Int
    defense_crush:Int
    defense_magic:Int
    defense_ranged:Int
    melee_strength:Int
    ranged_strength:Int
    magic_damage:Int
    prayer_bonus:Int
  }
  input EquipmentBonusFilter {
    attack_stab:Int
    attack_slash:Int
    attack_crush:Int
    attack_magic:Int
    attack_ranged:Int
    defense_stab:Int
    defense_slash:Int
    defense_crush:Int
    defense_magic:Int
    defense_ranged:Int
    melee_strength:Int
    ranged_strength:Int
    magic_damage:Int
    prayer_bonus:Int
  }

  type Equipment {
    bonuses:EquipmentBonus!
    slot:EquipmentSlot!
    requirements: [Requirement]
  }
  input EquipmentFilter {
    bonuses:EquipmentBonusFilter
    slot:EquipmentSlot
    #requirements: [Requirement] ###TODO
  }

  type EquipmentItem inherits Item implements ItemInterface {
    equipment:Equipment!
  }
  input EquipmentItemFilter inherits ItemFilter {
    equipment:EquipmentFilter
  }

  ########### WeaponItem ###########
  enum CombatStyle {
    chop,slash,lunge,block,stab,accurate,rapid,longrange,bash,pound,focus,spell, spell_defensive, swipe,spike,impale,smash,pummel,hack,reap,jab,fend,punch,kick,flick,lash,deflect,aim_and_fire,short_fuse,medium_fuse,long_fuse,scorch,flare,blaze
  }

  enum AttackType {
    slash,stab,crush,spellcasting,defensive_casting,ranged,magic
  }

  enum AttackStyle {
    accurate,aggressive,controlled,defensive,magic
  }

  enum WeaponXP {
    attack,strength,defence,ranged,magic
  }

  type WeaponStance {
    combat_style:CombatStyle!
    attack_type:AttackType
    attack_style:AttackStyle
    xp:[WeaponXP]!
    boosts:String
  }
  input WeaponStanceFilter {
    combat_style:CombatStyle
    attack_type:AttackType
    attack_style:AttackStyle
    xp:[WeaponXP]
    boosts:String
  }

  type Weapon {
    attack_speed:Int!
    type:String!
    stances:[WeaponStance]!
  }
  input WeaponFilter {
    attack_speed:Int
    type:String
    stances:[WeaponStanceFilter]
  }

  type WeaponItem inherits EquipmentItem implements ItemInterface{
    weapon:Weapon!
  }
  input WeaponItemFilter inherits EquipmentItemFilter {
    weapon:WeaponFilter
  }

  ## Inheritance definitions
  union ItemUnion = Item | EquipmentItem | WeaponItem

  input ItemUnionFilter inherits TLQueryOperators<ItemUnionFilter>,WeaponItemFilter {
  }

  #### Root ####

  extend type Query {
    item( filter:ItemUnionFilter, random:Boolean ): ItemInterface
    items( filter:ItemUnionFilter, random:Boolean, limit:Int ): [ItemInterface]
  }


`);
module.exports.resolvers = {
  Equipment:{
    requirements: equipment=>{ return Requirement.find({_id:{$in:equipment.requirementIDs}}) } //TODO test this
  },

  ItemInterface: {
    __resolveType(obj, context, info){
      return obj._type || 'Item'
    }
  },

  ItemUnion: {
    __resolveType(obj, context, info){
      return obj._type || 'Item'
    }
  },

  // ############# Root ################
  Query:{
    item: (parent, args) => {
      if(args.filter && args.filter.slot=='_2h')
        args.filter.slot='2h'
      return getDocument(Item)(parent, args)
    },
    items: (parent, args) => {
      if(args.filter && args.filter.slot=='_2h')
        args.filter.slot='2h'
      return getDocuments(Item)(parent, args)
    },
  }
}// changes: 2h to _2h