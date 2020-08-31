//@ts-check
const axios = require('axios').default;
const https = require('https')

// axios.get('https://www.osrsbox.com/osrsbox-db/items-complete.json').then(response=>{
//   console.log(response["0"]);
// });

const { chain }  = require('stream-chain');
const StreamObject = require('stream-json/streamers/StreamObject');
const fs = require('fs');

const _ = require('lodash');

async function stream(){

https.get('https://www.osrsbox.com/osrsbox-db/items-complete.json', function(res){

  let targets = [];
  let targetSet = new Set();

  let output = fs.createWriteStream('./test.json');
  const pipeline = chain(
    [
      res,
      StreamObject.withParser(),
      // data => new Promise(resolve => setTimeout(()=>resolve(data),500))
    ]
  );

  let counter=0;
  pipeline.on('data', data=>{
    counter++; 
    targetSet.add(data.value.stacked)
    // if(data.value.weapon && data.value.weapon.stances && _.find(data.value.weapon.stances, stance => stance.boosts!=null))
    //   interestingItems.push(data);
    // if(data.value.weapon && data.value.weapon.stances)
    //   data.value.weapon.stances.forEach(stance=>{targetSet.add(stance.experience)})
      // Object.entries(data.value.equipment.requirements).forEach(([key, value]) =>{
      //     targetSet.add(key) //fs.appendFileSync('./test.json',data.value.name+'\n')
      // })
      // interestingItems.add()
  });
  pipeline.on('end', data=>{
    console.log(`Stream finished with ${counter} items found`);
    console.log(targets)
    console.log(targetSet)
  });

})



  }

stream();