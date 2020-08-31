//@ts-check
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { Integer } = require('./_shared/schemas')

const PROXY_AREAS = ['al','ar','at','au','ba','be','bg','br','ca','ch','cl','cr','cy','cz','de','dk','ee','es','fi','fr','ge','gr','hk','hr','hu','id','ie','il','in','is','it','jp','kr','lu','lv','md','mk','mx','my','nl','no','nz','pl','pt','ro','rs','se','sg','si','sk','th','tr','tw','ua','uk','us','vn','za'];

const ProxyStatus = {
  stale: { type:Boolean, default:false },
  review: { type:Boolean, default:false },
  verified: { type:Date, default:()=>Date.now() }
}

const ProxySchema = new Schema(
  {
    host: { type:String, required:true },
    port: { ...Integer.Positive, required:true },
    area: { type:String, enum:PROXY_AREAS, required:true },
    username: String,
    password: String,
    ip: String,
    status: ProxyStatus
  }
);

ProxySchema.index({host: 1, port: 1}, {unique: true});

const Proxy = mongoose.model('Proxy', ProxySchema);

module.exports = { Proxy, PROXY_AREAS };