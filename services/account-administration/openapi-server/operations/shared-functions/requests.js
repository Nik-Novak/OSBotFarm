//@ts-check
const qs = require('querystring');
//imports for ts-check
const axios = require('axios').default;

/**
 * 
 * @param {axios} proxiedAxios 
 */
module.exports.sendEnableRequest = async function (accountIdentifier, otpKey, otpConfirmation, proxiedAxios, cookieJar){
  let headers = {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "en-US;q=0.7,en;q=0.3",
    "Cache-Control": "no-cache",
    "Host": "secure.runescape.com",
    "Origin": "https://secure.runescape.com",
    "Pragma": "no-cache",
    "Referer": `https://secure.runescape.com/m=totp-authenticator/${accountIdentifier}/enable`,
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:75.0) Gecko/20100101 Firefox/75.0",
    "Content-Type": "application/x-www-form-urlencoded",
  }
  let setUrl = `https://secure.runescape.com/m=totp-authenticator/${accountIdentifier}/set`
  let body = {
    key: otpKey,
    enteredPIN: otpConfirmation,
    submit: 'Finish'
  }
  return await proxiedAxios.post(setUrl, qs.stringify(body), {
    headers,
    jar: cookieJar,
    withCredentials:true 
  })
}

/**
 * 
 * @param {axios} proxiedAxios 
 */
module.exports.loadLoginPage = async function (proxiedAxios, cookieJar){
  let headers = {
    "Host": "secure.runescape.com",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:75.0) Gecko/20100101 Firefox/75.0",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US;q=0.7,en;q=0.3",
    "Accept-Encoding": "gzip, deflate, br",
    "Referer": "https://www.google.com/",
    "Connection": "keep-alive",
    "Pragma": "no-cache",
    "Cache-Control": "no-cache",
    "Upgrade-Insecure-Requests": 1
  }
  return await proxiedAxios.get('https://secure.runescape.com/m=weblogin/loginform.ws?mod=www&ssl=1&expired=0&dest=account_settings', {
    headers,
    jar: cookieJar
  });
}

/**
 * 
 * @param {axios} proxiedAxios 
 */
module.exports.sendLoginRequest = async function (username, password, recaptchaResponse, hiddenInputs, proxiedAxios, cookieJar){
  let headers = {
    "Host": "secure.runescape.com",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:75.0) Gecko/20100101 Firefox/75.0",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US;q=0.7,en;q=0.3",
    "Accept-Encoding": "gzip, deflate, br",
    "Content-Type": "application/x-www-form-urlencoded",
    "Origin": "https://secure.runescape.com",
    "Connection": "keep-alive",
    "Referer": "https://secure.runescape.com/m=weblogin/loginform.ws?mod=www&ssl=1&expired=0&dest=account_settings",
    "Upgrade-Insecure-Requests": 1,
    "Pragma": "no-cache",
    "Cache-Control": "no-cache"
  }
  let body = {
    username,
    password,
    'g-recaptcha-response':recaptchaResponse,
    ...hiddenInputs
  }
  // let body={
  //   username,
  //   password,
  //   'g-recaptcha-response':recaptchaResponse,
  //   theme: 'dual',
  //   mod: 'www',
  //   ssl: '1',
  //   dest: 'account_settings',
  //   //new fields
  //   correlationId,
  //   signature
  // }
  return await proxiedAxios.post('https://secure.runescape.com/m=weblogin/login.ws', qs.stringify(body),{
    headers,
    jar: cookieJar,
    withCredentials:true 
  });
}

/**
 * 
 * @param {axios} proxiedAxios 
 */
module.exports.sendOtpLogin = async function (otp, mfaCacheKeyField, proxiedAxios, cookieJar){
  let headers = {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "en-US;q=0.7,en;q=0.3",
    "Cache-Control": "no-cache",
    "Host": "secure.runescape.com",
    "Origin": "https://secure.runescape.com",
    "Pragma": "no-cache",
    "Referer": "Referer: https://secure.runescape.com/m=weblogin/login.ws",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:75.0) Gecko/20100101 Firefox/75.0",
    "Content-Type": "application/x-www-form-urlencoded",
  }
  let body={
    'mfa-capture-field': otp,
    'mfa-cache-key-field': mfaCacheKeyField,
    theme: 'dual',
    mod: 'www',
    ssl: '1',
    dest: 'account_settings'
  }
  return await proxiedAxios.post('https://secure.runescape.com/m=weblogin/mfa-capture', qs.stringify(body),{
    headers,
    jar: cookieJar,
    withCredentials:true 
  });
}


/**
 * 
 * @param {axios} proxiedAxios 
 */
module.exports.sendNavigationRequest = async function (url, referrer, proxiedAxios, cookieJar){
  let headers = {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "en-US;q=0.7,en;q=0.3",
    "Cache-Control": "no-cache",
    "Host": "secure.runescape.com",
    "Pragma": "no-cache",
    "Referer": referrer, //https://secure.runescape.com/m=totp-authenticator/c=Wxnoza4WK9o/account-info
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:75.0) Gecko/20100101 Firefox/75.0",
  }

  return await proxiedAxios.get(url, {
    headers,
    jar: cookieJar,
    withCredentials:true 
  });
}

/**
 * 
 * @param {axios} proxiedAxios 
 */
module.exports.sendCreateAccountRequest = async function (username, password, dob_day, dob_month, dob_year, recaptchaResponse, hiddenInputs, proxiedAxios, cookieJar){
  let headers = {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "en-US;q=0.7,en;q=0.3",
    "Cache-Control": "no-cache",
    "Content-Type": "application/x-www-form-urlencoded",
    "Origin": "https://secure.runescape.com",
    "Host": "secure.runescape.com",
    "Connection": "keep-alive",
    "Pragma": "no-cache",
    "Referer": "https://secure.runescape.com/m=account-creation/create_account?theme=oldschool",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:75.0) Gecko/20100101 Firefox/75.0",
  }

  let body={
    ...hiddenInputs,
    theme: ['oldschool', 'oldschool'],
    email1: username,
    password1: password,
    day: dob_day,
    month: dob_month,
    year: dob_year,
    'g-recaptcha-response': recaptchaResponse
  }

  console.log('body', body)
  console.log('stringified', qs.stringify(body))

  return await proxiedAxios.post('https://secure.runescape.com/m=account-creation/create_account', qs.stringify(body), {
    headers,
    jar: cookieJar,
    withCredentials:true 
  });
}