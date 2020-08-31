//@ts-check
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const regexParser = require('regex-parser');

let config;

function success(req, res, generatedName, generatedPronounciation){
  console.log('SUCCESS')
  // build response here
  let response = {
    name: generatedName,
    pronounciation: generatedPronounciation
  }
  res.status(200).send(response);
}

function fail(req, res, message){
  console.log('FAILURE')
  let response = {
    code: 500,
    error: message,
    message: "Internal server error",
    path: "generateName"
  }
  res.status(500).send(response);
}

let operationHandler = function(req, res){
  console.log('Executing Operation: ' + path.relative(process.cwd(),__filename));
  let params = req.body;
  console.log(params);
  let generatedName, generatedPronounciation;
  try{
    let result = generateNameAndPronounce(params);
    generatedName = result.generatedName;
    generatedPronounciation = result.generatedPronounciation;
  } catch(err){
    if(err instanceof MaxAttemptsError)
      fail(req, res, "Server ran out of attempts while attempting to generate the string with the provided parameters. This could be due to over-constrained length or wordLength parameters. Maybe try again with less constraining parameters.");
    else
      throw err;
  }
  console.log("generated: ", generatedName + ' | ' + generatedPronounciation);
  success(req, res, generatedName, generatedPronounciation);
}

function generateNameAndPronounce(params){
  const MAX_TRIES = 20;
  let generatedName = "";
  let generatedPronounciation = "";
  let tries=0;
  while(generatedName.length-1 < params.minLength && tries < MAX_TRIES){ //-1 on word length to account for added trailing spaces
    let [word, pronounciation] = execSync('mono $HAUYNE_DIR/Hauyne.exe $HAUYNE_DIR/Examples/Example.txt main 1').toString().split(' ');
    word = word.trim();
    word = substitute(word, params.substitutions);
    pronounciation = pronounciation.trim();
    pronounciation = pronounciation.substring(1, pronounciation.length-1); //remove surrounding brackets on pronounciation
    if(word.length<params.minWordLength || word.length > params.maxWordLength){
      ++tries; continue;
    }
    if(word.length + generatedName.length-1 < params.maxLength){
      generatedName+=word + " ";
      generatedPronounciation+=pronounciation + " "
    }
    else
      ++tries;
  }
  if (tries>=MAX_TRIES)
    throw new MaxAttemptsError("Out of attempts");
  generatedName = generatedName.trim();
  generatedPronounciation = generatedPronounciation.trim();
  return {generatedName, generatedPronounciation};
}

function substitute(inputString, substitutions){
  substitutions.forEach(substitution => {
    let regex = regexParser(substitution.regex);
    console.log(regex)
    let matches = [];
    let m;
    do {
      m = regex.exec(inputString);
      if(m)
        matches.push(m);
    } while(m);
    console.log('matches:', matches);
    inputString = inputString.replace(regex, function(match,offset, string){
      if(Math.random() < substitution.chance){
        let randomIndex = Math.floor(Math.random()*substitution.oneOf.length);
        return substitution.oneOf[randomIndex];
      }
      else
        return match
    });
  });
  return inputString;
}

class MaxAttemptsError extends Error {}

module.exports = function(cfg){
  config = cfg;
  return operationHandler
}