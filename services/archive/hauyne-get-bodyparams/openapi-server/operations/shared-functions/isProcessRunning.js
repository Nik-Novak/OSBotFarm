var execSync = require('child_process').execSync;
/**
 * In: process name
 * 
 * Out: list of process IDs matching name | false (if none)
 */
function isProcessRunning(pName){
  let pid;
  try {
    pid = execSync(`pgrep ${pName}`).toString();
  }catch(err){ 
    if(err.status!=1){//finding no result with grep counts as an error somehow....;
      console.log(err);
      throw new Error(err); //incase command fails somehow
    } 
  }
  if (pid)
    return pid.split('\n').slice(0,-1).map(x=>parseInt(x));;
  
  return false;
}

module.exports=isProcessRunning;