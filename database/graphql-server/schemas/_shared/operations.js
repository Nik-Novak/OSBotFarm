//@ts-check
const { flatten, renameAndFlattenFilter } = require("./functions");

//stupid workaround for aggregate queries bug with not returning id field populated
function rename_idtoid(document){
  if(document != null && typeof document[Symbol.iterator] === 'function')
    for(let doc of document)
      doc.id = doc._id
  else
    document.id = document._id;
  return document
}

// ########### Queries ################

let getDocument = function(DBModel){
  return async (parent, args) => {
    let filter = renameAndFlattenFilter(args.filter);
    if(args.random)
      return rename_idtoid( (await DBModel.aggregate([{ $match:filter }, { $sample:{size:1} }]))[0] )
    else
      return DBModel.findOne(renameAndFlattenFilter(args.filter))/*.then(result=>console.log(result))*/ 
    };
}

let getDocuments = function(DBModel){
  return async (parent, args) => {
    let filter = renameAndFlattenFilter(args.filter);
    if(args.random)
      return rename_idtoid( await DBModel.aggregate([{ $match:filter }, { $sample:{size:args.limit||Number.MAX_SAFE_INTEGER} }]) );
    else
      return args.limit ? DBModel.find(renameAndFlattenFilter(args.filter)).limit(args.limit) : DBModel.find(renameAndFlattenFilter(args.filter))
  };
}

// ########### Mutations ################
let updateDocument = function(DBModel){
  return (parent, args) => { 
    let flatUpdate = flatten(args.update);
    // console.log(flatUpdate);
    return DBModel.findOneAndUpdate( renameAndFlattenFilter(args.filter), flatUpdate, {new: true, runValidators: true, strict:false} )
  }
}

let updateDocuments = function(DBModel){ //TODO currently maked 2 queries per account, can probably clean this up
  return async (parent, args) => {
    let flatUpdate = flatten(args.update);
    let queriedAccounts = await DBModel.find(renameAndFlattenFilter(args.filter));
    let updatedAccounts=[];
    queriedAccounts.forEach(account => 
      updatedAccounts.push( DBModel.findByIdAndUpdate(account._id, flatUpdate, {new:true, runValidators: true, strict:false}) )
    )
    return updatedAccounts;
  }
}

let deleteDocument = function(DBModel){
  return (parent, args) => DBModel.findOneAndDelete(renameAndFlattenFilter(args.filter))
}

let deleteDocuments = function(DBModel){
  return async (parent, args) => {
    let queriedAccounts = await DBModel.find(renameAndFlattenFilter(args.filter));
    let deletedAccounts = [];
    queriedAccounts.forEach(account => 
      deletedAccounts.push( DBModel.findByIdAndDelete(account._id) )
    )
    return deletedAccounts;
  }
}

module.exports = { getDocument, getDocuments, updateDocument, updateDocuments, deleteDocument, deleteDocuments }