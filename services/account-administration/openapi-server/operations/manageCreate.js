//@ts-check
const path = require('path');
const fs = require('fs');
const axios = require('axios').default;
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');
const { TwoCaptchaSolver } = require('twocaptcha-solver');
const cheerio = require('cheerio');

const { keepAlive, createProxiedAxios, getAccountIdentifierFromUrl, fullLogin } = require('./shared-functions/utility');
const { sendLoginRequest, sendEnableRequest, sendNavigationRequest, loadLoginPage, sendCreateAccountRequest } = require('./shared-functions/requests');

let config;

function success(req, res, {username, password, date_of_birth}){
  console.log('SUCCESS')
  // build response here
  res.status(200).send({username, password, date_of_birth});
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
  const {username, password, date_of_birth, proxyHost, proxyPort, proxyUsername, proxyPassword} = req.body;
  const dob_day = new Date(date_of_birth).getDate();
  const dob_month = new Date(date_of_birth).getMonth()+1;
  const dob_year = new Date(date_of_birth).getFullYear();
  let proxiedAxios = proxyHost ? createProxiedAxios(axios, proxyUsername, proxyPassword, proxyHost, proxyPort) : axios; //if proxyHost is defined, create proxiedAxios
  // axiosCookieJarSupport(proxiedAxios);
  const twoCaptchaSolver = new TwoCaptchaSolver(
    '03ea85d5264a00dd1d9b3d0bb93890f4', 
    '6Lcsv3oUAAAAAGFhlKrkRb029OHio098bbeyi_Hv', 
    'https://secure.runescape.com/m=account-creation/create_account?theme=oldschool',
    {
      proxyHost, proxyPort, proxyUsername, proxyPassword, proxyType:'SOCKS5'
    }
  );
  keepAlive(res);
  let start = Date.now();
  const cookieJar = new tough.CookieJar();
  proxiedAxios.get('https://api.ipify.org?format=json')
    .then(ipResult=>{
      console.log('Using IP:', ipResult.data.ip);
      twoCaptchaSolver.solve().then(async recaptchaResponse=>{
        console.log(`Captcha took ${(Date.now()-start)/1000} seconds to solve.`);
        const cookieJar = new tough.CookieJar();
        //NAVIGATE TO ACCOUNT CREATE
        let navUrl = `https://secure.runescape.com/m=account-creation/create_account?theme=oldschool`
        console.log('Navigating to account create page:')
        let navResponse = await sendNavigationRequest(navUrl, 'https://www.runescape.com/', proxiedAxios, cookieJar);
        $ = cheerio.load(navResponse.data);
        let navResponseTitle = $('head title').html();
        let navResponseUrl = navResponse.request.res.responseUrl;
        if(!navResponseTitle.includes('Create Your Account')){
          console.log('UNEXPECTED_PAGE:', navResponseTitle);
          console.log(navResponse.data);
          fail(req, res,'An unexpected page was found while navigating. The page had the following title: ' + navResponseTitle);
          return;
        }
        let hiddenInputs = {};
        $('form input[type="hidden"]').each(function(index, input){
          let name = $(this).attr('name');
          let value = $(this).val();
          hiddenInputs[name] = value;
        });
        console.log('HIDDEN INPUTS:', hiddenInputs);

        //CREATE ACCOUNT
        let createAccountResponse = await sendCreateAccountRequest(username, password,dob_day, dob_month, dob_year, recaptchaResponse, hiddenInputs, proxiedAxios, cookieJar);
        $ = cheerio.load(createAccountResponse.data);
        let createAccountResponseTitle = $('head title').html();
        let createAccountResponseUrl = createAccountResponse.request.res.responseUrl;
        if(!createAccountResponseTitle.includes('Account Created')){
          console.log('UNEXPECTED_PAGE:', createAccountResponseTitle);
          console.log(navResponse.data);
          fail(req, res,'An unexpected page was found while navigating. The page had the following title: ' + createAccountResponseTitle);
          return;
        }
        success(req, res, {username, password, date_of_birth} );
      }
      ).catch(err=>{
        fail(req,res,err.message);
        console.log(err);
      });
  }).catch(err=>{
    fail(req, res, 'Failed to fetch IP, this is likely a proxy error:\n' + err.message);
  });
}

module.exports = function(cfg){
  config = cfg;
  return operationHandler
}