//@ts-check
const axios = require('axios').default;

class TwoCaptchaSolver {
  constructor(apiKey, siteKey, url, options){
    this.apiKey = apiKey;
    this.siteKey = siteKey;
    this.url = url;
    if(options.proxyHost){
      this.proxyHost = options.proxyHost;
      this.proxyPort = options.proxyPort;
      this.proxyUsername = options.proxyUsername;
      this.proxyPassword = options.proxyPassword;
      this.proxyType = options.proxyType;
    }
  }

  solve(){
    return new Promise((resolve, reject)=>{
      console.log('NEW promise')
      let body = {
        key:this.apiKey,
        method:'userrecaptcha',
        googlekey:this.siteKey,
        pageurl:this.url,
      };
      if(this.proxyHost){ //if proxy defined
        if(this.proxyUsername)
          body.proxy=`${this.proxyUsername}:${this.proxyPassword}@${this.proxyHost}:${this.proxyPort}`
        else
          body.proxy=`${this.proxyHost}:${this.proxyPort}`
        body.proxytype=this.proxyType;
      }
      axios.post('http://2captcha.com/in.php',body).then(response=>{
        console.log('INIT request')
        console.log('Status:', response.status, response.statusText, 'wtf1')
        console.log(response.data);
        let captchaID = response.data.split('|')[1];
        console.log('response.data:', response.data);
        console.log('captchaID:', captchaID);
        if(!captchaID)
          reject('Request to 2captcha.com failed.')
          let attemptCount = 0;
        let readyCheck = setInterval(()=>{
          ++attemptCount;
          axios.get(`http://2captcha.com/res.php?key=${this.apiKey}&action=get&id=${captchaID}`).then(response=>{
            console.log('Status:', response.status, response.statusText, ' ID:', captchaID, ' Attempt:', attemptCount, 'wtf2');
            console.log(response.data);
            if(response.data.includes('OK')){
              clearInterval(readyCheck);
              resolve(response.data.split('|')[1]);
            }
            else if(response.data.includes('ERROR')){
              clearInterval(readyCheck);
              reject(response.data);
            }
            else
              console.log('Unknown State, check code')
            if(attemptCount>300){
              clearInterval(readyCheck);
              reject('ABORT: Captcha took over 300 seconds.')
            }
          })
        },1000);
      });
    })
  }
}

module.exports = {TwoCaptchaSolver};