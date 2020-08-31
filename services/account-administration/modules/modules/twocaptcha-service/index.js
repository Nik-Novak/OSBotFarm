//@ts-check

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
      let params = `key=${this.apiKey}&method=userrecaptcha&googlekey=${this.siteKey}&pageurl=${this.url}`;
      if(this.proxyHost){ //if proxy defined
        if(this.proxyUsername)
          params+=`&proxy=${this.proxyUsername}:${this.proxyPassword}@${this.proxyHost}:${this.proxyPort}`
        else
          params+=`&proxy=${this.proxyHost}:${this.proxyPort}`
        params+=`&proxytype=${this.proxyType}`
      }
      resolve('http://2captcha.com/in.php?'+params);
    })
  }
}

module.exports = {TwoCaptchaSolver};