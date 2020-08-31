//@ts-check
const { GraphQLScalarType, GraphQLInputObjectType, GraphQLError, Kind } = require("graphql");

const comparisonOperators = ['_eq', '_gt', '_gte', '_in', '_lt', '_lte', '_ne', '_nin'];
const logicalOperators = ['_not'];

/**
 * 
 * @param {string[]} propertyList 
 * @param {string[]} keys 
 */
function atleastOneIntersection(propertyList, keys){
  for (let key of keys){
    if (propertyList.includes(key))
      return true;
  }
  return false;
}

function parseAST(ast){
  // console.log(ast)
  // console.log('\n\n')
  switch(ast.kind){
    case Kind.INT: return ast.value
    case Kind.BOOLEAN: return ast.value
    case Kind.STRING: return ast.value
    case Kind.ENUM: return ast.value
    case Kind.FLOAT: return ast.value
    case Kind.NULL: return null
    case 'ListValue':
      // console.log('HERE', ast)
      let list = ast.values.map(listValueObj=>parseAST(listValueObj));
      // console.log('HERE', list)
      return list;
    case 'ObjectField':
      return parseAST(ast.value);
    case 'ObjectValue':
      let obj = {};
      ast.fields.forEach(field=>{
        let newFieldName = field.name.value.replace('_','$');
        let newFieldValue = parseAST(field);
        obj[newFieldName] = newFieldValue;
      });
      return obj;
    default:
      console.log('ERROR')
      throw Error('Unsupported Literal Value was passed in: ' + ast.kind);
  }
}

const noSupportedOperatorsError = new GraphQLError("Object did not have any of the supported operators: " + comparisonOperators);

function isNumberFilter(value){
  if(typeof value !== 'number' || typeof value !== 'object')
      throw new GraphQLError("Value passed is not a number or object.")
    if( typeof value === 'object' )
      if(!atleastOneIntersection(comparisonOperators.concat(logicalOperators), Object.keys(value)))
        throw noSupportedOperatorsError
    return value;
}

const GraphQLValueFilter = new GraphQLScalarType({
  name: "NumberFilter",
  description: "A type that allows filtering of Numbers",
  serialize: value=>isNumberFilter(value),
  parseValue: value=>isNumberFilter(value),
  parseLiteral: ast=>{
    switch(ast.kind){
      case Kind.INT: return ast.value
      case Kind.BOOLEAN: return ast.value
      case Kind.STRING: return ast.value
      case Kind.ENUM: return ast.value
      case Kind.FLOAT: return ast.value
      case Kind.NULL: return null
      case Kind.OBJECT:
        if(!atleastOneIntersection(comparisonOperators.concat(logicalOperators), ast.fields.map(astField=>astField.name.value)))
          throw noSupportedOperatorsError;
        // console.log(require('util').inspect(ast,false,99))
        let query = parseAST(ast);
        // console.log('QUERY', query)
        return query;
      default: throw new GraphQLError('Unknown Literal, supported types are: Int | Object');
    }
  },
});

module.exports = { GraphQLValueFilter };