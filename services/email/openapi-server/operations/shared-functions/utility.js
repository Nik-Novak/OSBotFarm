//@ts-check
const SocksProxyAgent = require('socks-proxy-agent');
const cheerio = require('cheerio');
const otpUtilities = require('otp-utilities');

const {sendLoginRequest, sendOtpLogin} = require('./requests');

module.exports.createProxiedAxios = function (axios, proxyUsername, proxyPassword, proxyHost, proxyPort){
  const proxyURL = `socks5://${proxyUsername}:${proxyPassword}@${proxyHost}:${proxyPort}`;
  const httpsAgent = SocksProxyAgent(proxyURL);
  let proxiedAxios = axios.create({httpsAgent});
  return proxiedAxios;
}

module.exports.keepAlive = (res)=>{
  if(!res.finished){
      console.log('Sending Keep-alive');
      res.writeProcessing();
      setTimeout(()=>this.keepAlive(res),1000)
  }
}

/**
 * Handles logging into account settings with or without OTP
 */
module.exports.fullLogin = async function(username, password, otp_key, recaptchaResponse, allowedTitleIncludes, proxiedAxios, cookieJar){ //mod: 'www', dest:'account_settings' for default login page
  //LOGIN
  console.log('Logging into account: ',username);
  let loginResponse = await sendLoginRequest(username, password, recaptchaResponse, proxiedAxios, cookieJar); //'totp-authenticator', 'enable',
  let $ = cheerio.load(loginResponse.data);
  let loginResponseTitle = $('head title').html();
  let titleIsAllowed = checkTitle(loginResponseTitle, ['RuneScape - MMORPG - The No.1 Free Online Multiplayer Game', ...allowedTitleIncludes]);
  if(titleIsAllowed)
    return loginResponse;
  else if(loginResponseTitle.includes('Authenticator')){
    return fullLoginHandleOtp(loginResponse, otp_key, allowedTitleIncludes, proxiedAxios, cookieJar);
  }
  else if (loginResponseTitle.includes('Set Email'))
    throw Error('Jagex is enforcing a valid email to be set in order to access the account. This likely means it is banned and/or locked, but the actual account state cannot be determined. Please continue manually at your own risk.')
  else throw Error('An unexpected page was found while logging in. The page had the following title: ' + loginResponseTitle);
}
/**
 * Check if a title includes any of the allowedTitleIncludes
 * @param {string} responseTitle Title of the response page
 * @param {string[]} allowedTitleIncludes List of any additional titles
 */
function checkTitle(responseTitle, allowedTitleIncludes){
  for(let allowedTitleInclude of allowedTitleIncludes){ //check list ofs titles to allow. if match, return the response instead of erroring
    console.log(responseTitle, allowedTitleInclude, responseTitle.includes(allowedTitleInclude))
    if(responseTitle.includes(allowedTitleInclude))
      return true;
  };
  return false;
}
async function fullLoginHandleOtp(loginResponse, otp_key, allowedTitleIncludes, proxiedAxios, cookieJar){
  if(!otp_key)
        throw Error('Authenticator was found but no otp_key was provided.');
  let $ = cheerio.load(loginResponse.data);
  let otp = otpUtilities.generate(otp_key);
  let mfaCacheKeyField = $('form input[name="mfa-cache-key-field"]').val();
  console.log('Authenticator found, continuing login with otp:', otp, ' mfa-cache-key-field:', mfaCacheKeyField);
  let otpResponse = await sendOtpLogin(otp, mfaCacheKeyField, proxiedAxios, cookieJar);
  $ = cheerio.load(otpResponse.data);
  let otpResponseTitle = $('head title').html();
  let titleIsAllowed = checkTitle(otpResponseTitle, ['RuneScape - MMORPG - The No.1 Free Online Multiplayer Game', ...allowedTitleIncludes]);
  if(titleIsAllowed)
    return otpResponse
  else if (otpResponseTitle.includes('Set Email'))
    throw Error('Jagex is enforcing a valid email to be set in order to access the account. This likely means it is banned and/or locked, but the actual account state cannot be determined. Please continue manually at your own risk.')
  else throw Error('An unexpected page was found while logging in(Phase: otp). The page had the following title: ' + otpResponseTitle);
}

module.exports.getAccountIdentifierFromUrl = function(url){
  let accountIdentifer = url.match(/\/s=.*\/|\/c=.*\//)[0];
  accountIdentifer = accountIdentifer.substring(1, accountIdentifer.length-1);
  return accountIdentifer;
}