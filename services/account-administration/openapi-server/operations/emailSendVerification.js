//@ts-check
const path = require('path');
const fs = require('fs');
const axios = require('axios').default;
const tough = require('tough-cookie');
const { TwoCaptchaSolver } = require('twocaptcha-solver');
const cheerio = require('cheerio');
const otpUtilities = require('otp-utilities');

const { keepAlive, createProxiedAxios, getAccountIdentifierFromUrl } = require('./shared-functions/utility');
const { sendLoginRequest, sendEnableRequest } = require('./shared-functions/requests');

let config;

function success(req, res, otpKey){
  console.log('SUCCESS')
  // build response here
  res.status(200).send({otpKey});
}

function existing(req, res){
  console.log('EXISTING')
  res.status(304).send();
}

function fail(req, res, error){
  console.log('FAILURE')
  let body = {
    code: 500,
    error,
    message: 'Internal Server Error',
    path: '2faEnable'
  }
  res.status(500).send(body);
}

let operationHandler = function(req, res){
  console.log('Executing Operation: ' + path.relative(process.cwd(),__filename));
  let {username, password, email, emailPassword, proxyHost, proxyPort, proxyUsername, proxyPassword} = req.body;
  let proxiedAxios = createProxiedAxios(axios, proxyUsername, proxyPassword, proxyHost, proxyPort);
  const twoCaptchaSolver = new TwoCaptchaSolver(
    '03ea85d5264a00dd1d9b3d0bb93890f4', 
    '6Lcsv3oUAAAAAGFhlKrkRb029OHio098bbeyi_Hv', 
    'https://secure.runescape.com/m=weblogin/loginform.ws?mod=www&ssl=1&expired=0&dest=account_settings',
    {
      proxyHost, proxyPort, proxyUsername, proxyPassword, proxyType:'SOCKS5'
    }
  );
  keepAlive(res);
  let start = Date.now();
  twoCaptchaSolver.solve().then(async recaptchaResponse=>{
    console.log(`Captcha took ${(Date.now()-start)/1000} seconds to solve.`);
    const cookieJar = new tough.CookieJar();
    //LOGIN
    console.log('Logging into account: ',username);
    let loginResponse = await sendLoginRequest(username, password, recaptchaResponse, proxiedAxios, cookieJar);
    let $ = cheerio.load(loginResponse.data);
    let loginResponseTitle = $('head title').html();
    if(!loginResponseTitle.includes('Enable Authenticator')){
      if(loginResponseTitle.includes('Authenticator')){
        existing(req, res); //authenticator already set
        return;
      }
      else{
        console.log('UNEXPECTED_PAGE:', loginResponseTitle);
        console.log(loginResponse.data);
        fail(req, res,'An unexpected page was found while logging in. The page had the following title: ' + loginResponseTitle);
        return;
      }
    }
    //ENABLE 2FA
    let otpKey = $('article[data-js-wizard-slide-title="Scan"] details strong').html();
    console.log('OTP_KEY:', otpKey);
    console.log
    let otpConfirmation = otpUtilities.generate(otpKey);
    console.log('OTP_CONFIRMATION:', otpConfirmation);
    let enableUrl = loginResponse.request.res.responseUrl;
    console.log('ENABLE_URL:', enableUrl);
    console.log('Enabling 2fa with key:', otpKey);
    let enableResult = await sendEnableRequest(enableUrl, otpKey, otpConfirmation, proxiedAxios, cookieJar);
    $ = cheerio.load(enableResult.data);
    let enableResultTitle = $('head title').html().toString();
    if(enableResultTitle.includes('Authenticator Set'))
      success(req, res, otpKey);
    else
      fail(req, res, 'An unexpected page was found while setting the authenticator. The page had the following title: ' + enableResultTitle+'. In case the authenticator was set, here\'s the otpKey: ' + otpKey);
  }
  ).catch(err=>fail(req,res,err.message));
  
  // proxiedAxios.get('https://whatismyipaddress.com/').then(response=>{
  //   console.log(response.data.substr(response.data.search("id='ipv4'"),100));
  // })
}

module.exports = function(cfg){
  config = cfg;
  return operationHandler
}