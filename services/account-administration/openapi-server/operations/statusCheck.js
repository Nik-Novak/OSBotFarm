//@ts-check
const path = require('path');
const fs = require('fs');
const axios = require('axios').default;
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');
const { TwoCaptchaSolver } = require('twocaptcha-solver');
const cheerio = require('cheerio');
const otpUtilities = require('otp-utilities');

const { keepAlive, createProxiedAxios, getAccountIdentifierFromUrl, fullLogin } = require('./shared-functions/utility');
const { sendLoginRequest, sendEnableRequest, sendNavigationRequest, loadLoginPage } = require('./shared-functions/requests');

let config;

function success(req, res, status, offences){
  console.log('SUCCESS')
  // build response here
  res.status(200).send({status, offences});
}

function fail(req, res, error){
  console.log('FAILURE')
  let body = {
    code: 500,
    error,
    message: 'Internal Server Error',
    path: 'statusCheck'
  }
  res.status(500).send(body);
}

let operationHandler = function(req, res){
  console.log('Executing Operation: ' + path.relative(process.cwd(),__filename));
  let {username, password, otpKey, proxyHost, proxyPort, proxyUsername, proxyPassword} = req.body;
  let proxiedAxios = proxyHost ? createProxiedAxios(axios, proxyUsername, proxyPassword, proxyHost, proxyPort) : axios; //if proxyHost is defined, create proxiedAxios
  // axiosCookieJarSupport(proxiedAxios);
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
  const cookieJar = new tough.CookieJar();
  proxiedAxios.get('https://api.ipify.org?format=json').then(result=>console.log('IP:',result.data.ip));
  twoCaptchaSolver.solve().then(async recaptchaResponse=>{
    console.log(`Captcha took ${(Date.now()-start)/1000} seconds to solve.`);
    const cookieJar = new tough.CookieJar();
    //LOGIN
    let allowedTitleIncludes = ['Login Error'];
    let loginResponse = await fullLogin(username,password,otpKey,recaptchaResponse,allowedTitleIncludes,proxiedAxios,cookieJar);
    let $ = cheerio.load(loginResponse.data);
    let loginResponseTitle = $('head title').html();
    let loginResponseUrl = loginResponse.request.res.responseUrl;
    if(loginResponseTitle.includes('Login Error'))
      if($('body a.a-button').filter(function(){ return $(this).text().includes('Unlock') }).length >0 ){
        success(req, res, 'locked', null); //LOCKED
        return;
      }
    console.log('Successfully logged in')
    //NAVIGATE TO ACCOUNT STATUS
    let accountIdentifier = getAccountIdentifierFromUrl(loginResponseUrl);
    let navUrl = `https://secure.runescape.com/m=offence-appeal/${accountIdentifier}/account-history`
    console.log('Navigating to account status page:')
    let navResponse = await sendNavigationRequest(navUrl, 'https://www.runescape.com/', proxiedAxios, cookieJar);
    $ = cheerio.load(navResponse.data);
    let navResponseTitle = $('head title').html();
    let navResponseUrl = navResponse.request.res.responseUrl;
    if(!navResponseTitle.includes('Account History')){
      console.log('UNEXPECTED_PAGE:', navResponseTitle);
      console.log(navResponse.data);
      fail(req, res,'An unexpected page was found while navigating. The page had the following title: ' + navResponseTitle);
      return;
    }

    //PROCESS RESULTS
    let offences = [];
    $('body table tbody tr').each(function(index, tr){
      let $tds = $(this).children('td')
      let date = $tds.first().html();
      let offence = $tds.last().children('a').first().html();
      offences.push({date, offence});
    });
    let bannedText = $('body strong').html();
    if(bannedText && bannedText.includes('Banned'))
      success(req,res,'banned',offences); //BANNED
    else
      success(req, res, 'active', offences); //ACTIVE
  }
  ).catch(err=>{
    fail(req,res,err.message);
    console.log(err);
  });
}

module.exports = function(cfg){
  config = cfg;
  return operationHandler
}