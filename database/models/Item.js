//@ts-check
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { Requirement } = require('./Requirement');

const { Integer, ExistingID, Icon } = require('./_shared/schemas');

const options = {discriminatorKey: '_type'};

const LinkedItemsSchema = new Schema({
  itemID: Integer.Positive, //linked ID of actual item (if noted or placeholder)
  notedID: Integer.Positive,  //linked ID of noted version of item
  placeholderID: Integer.Positive, //linked ID of placeholder item
});

const TradeSchema = new Schema({
  tradeable: { type:Boolean, required:true },
  tradeable_on_ge: { type:Boolean, required:true },
  buy_limit: { ...Integer.Positive }, 
  store_cost: { ...Integer.Positive, required:true }, 
  lowalch: { ...Integer.Positive, required:true }, 
  highalch: { ...Integer.Positive, required:true }, 
});

const ItemSchema = new Schema(
  {
    itemID:         { ...Integer.Positive, required:true },
    name:           { type:String, required:true },
    examine:        String,
    incomplete:     { type:Boolean, required:true },
    members:        { type:Boolean, required:true },
    noted:          { type:Boolean, required:true },
    noteable:       { type:Boolean, required:true },
    stacked:        { type:Number },
    stackable:      { type:Boolean, required:true },
    weight:         { type:Number, default:0 }, 
    quest_item:     { type:Boolean, required:true }, 
    release_date: Date,
    trade:          { type:TradeSchema, required:true },
    linked_items:   { type:LinkedItemsSchema },
    placeholder:    { type:Boolean, required:true },
    equipable:      { type:Boolean, required:true }, //right-click has equip option
    equipable_by_player: { type:Boolean, required:true }, //actually equippable
    equipable_weapon: { type:Boolean, required:true }, 
    duplicate:      { type:Boolean, required:true },
    wiki_name:      String,
    wiki_url:       String,
    icon:           Icon
  }, options
);
ItemSchema.index({itemID: 1}, {unique: true});
ItemSchema.index({itemID: 1, name:1}, {unique: true});

const Item = mongoose.model('Item', ItemSchema);


// ############ EquipmentItem #############

const EquipmentBonusSchema = {
  attack_stab: { ...Integer, default:0 },
  attack_slash: { ...Integer, default:0 },
  attack_crush: { ...Integer, default:0 },
  attack_magic: { ...Integer, default:0 },
  attack_ranged: { ...Integer, default:0 },
  defense_stab: { ...Integer, default:0 },
  defense_slash: { ...Integer, default:0 },
  defense_crush: { ...Integer, default:0 },
  defense_magic: { ...Integer, default:0 },
  defense_ranged: { ...Integer, default:0 },
  melee_strength: { ...Integer, default:0 },
  ranged_strength: { ...Integer, default:0 },
  magic_damage: { ...Integer, default:0 },
  prayer_bonus: { ...Integer, default:0 },
};

const EquipmentSchema = new Schema({
  bonuses: EquipmentBonusSchema,
  slot: { type:String, enum:['head','neck','cape','ammo','body','weapon','shield','legs','feet','hands','ring','2h'], required:true },
  requirementIDs: { type:[ExistingID(Requirement)], default:[]}
})

const EquipmentItemSchema_base = {
  equipment: EquipmentSchema,
}
const EquipmentItemSchema = new Schema(
  EquipmentItemSchema_base, options
);
const EquipmentItem = Item.discriminator('EquipmentItem', EquipmentItemSchema);

// ############ WeaponItem #############
const WeaponStanceSchema = new Schema(
  {
    combat_style: {
      type: String, 
      enum:['chop','slash','lunge','block','stab','accurate','rapid','longrange','bash','pound','focus','spell', 'spell_defensive','swipe','spike','impale','smash','pummel','hack','reap','jab','fend','punch','kick','flick','lash','deflect','aim_and_fire', 'short_fuse','medium_fuse','long_fuse','scorch','flare','blaze'],
      required:true, 
    },
    attack_type: {
      type: String, 
      enum:['slash','stab','crush','spellcasting','defensive_casting','ranged','magic'],
    },
    attack_style: {
      type: String, 
      enum:['accurate','aggressive','controlled','defensive','magic'],
    },
    xp: {
      type: [{type: String, enum:['attack','strength','defence','ranged','magic'], required:true}], 
      required:true
    },
    boosts: String
  }
);

const WeaponSchema = new Schema({
  attack_speed: { ...Integer.Positive, required:true },
  type: { type:String, required:true }, //TODO: enum this
  stances: { type:[WeaponStanceSchema], required:true },
});

const WeaponItemSchema = new Schema(
  {
    ...EquipmentItemSchema_base, //inherits from EquipmentItem (done this way since mongoose doesnt allow deeper inherit depth)
    weapon: WeaponSchema,
  }, options
);
const WeaponItem = Item.discriminator('WeaponItem', WeaponItemSchema);

module.exports = { Item, EquipmentItem, WeaponItem }