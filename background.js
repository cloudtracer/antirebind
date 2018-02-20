var dns = {};
var cancelRequestsTo = {};
var ignorePingCheck = {};

var checkDomain = {};

function SendPingCheck(url){
    var xmlhttp;
    xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function(){
      if (xmlhttp.readyState == 4){
        //console.log("[SendPingCheck] unset ignore ping check for url: " + url);
        ignorePingCheck[url] = false;
      }
    }
    xmlhttp.open("GET", url, true);
    xmlhttp.setRequestHeader('Cache-Control', 'no-cache');
    xmlhttp.send();
}


setInterval(function(){
  var keyNames = Object.keys(checkDomain);
  var l = keyNames.length;
  for(var i = 0; i<l; i++){
    var url = keyNames[i];
    ignorePingCheck[url] = true;
    //console.log("[ignorePingCheck] set for ping url: " + url);
    //console.log("[BLOCKED DOMAIN - "+keyNames[i]+"] - Checking to see if rebind attack is over with url: " + url);
    delete checkDomain[url];
    SendPingCheck(url);
  }
}.bind(this), 10000);


function CheckDNS(fqdn, ip){
  if(!ip) return true; //cached maybe?
  if(dns[fqdn]){
    //new ip is rfc1918
    if(/(^127\.)|(^192\.168\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^::1$)|(^[fF][cCdD])/.test(ip)){
      if(!/(^127\.)|(^192\.168\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^::1$)|(^[fF][cCdD])/.test(dns[fqdn])){
        console.log("[DNS REBIND ATTACK DETECTED] - " + fqdn + " - " + ip);
        cancelRequestsTo[fqdn] = ip;
        return false;
      } else {
        //or else what?
      }
    } else {
      // set dns to new ip
      if(dns[fqdn] != ip){
        dns[fqdn] = ip;
        //console.log("[IP CHANGE] - " + fqdn + " - " + ip);
      } else {
        dns[fqdn] = ip;
      }
    }
  } else {
    // set dns initially
    //console.log("[IP SET] - " + fqdn + " - " + ip );
    dns[fqdn] = ip;
  }
  if(cancelRequestsTo[fqdn]){
    console.log("[REBIND ATTACK OVER] for domain " + fqdn + " removing block.");
    delete cancelRequestsTo[fqdn];
  }
  return true;
}

function getHostData(url) {
	var m = /^(?:(\w+):)?\/\/([^\/\?#]+)/.exec(url);
	if (!m || !m[2]) {
		return null;
	}
	var result = {
		scheme:m[1],
		initialHost:m[2],
		host:m[2],
		forceReplace:false
	};
	return result;
}

chrome.webRequest.onResponseStarted.addListener(function (details){
  //console.log("Response started " + JSON.stringify(details));
  var hostData = getHostData(details.url);
	if (!hostData) return;
  /*
  if(ignorePingCheck[details.url]){
    console.log("IgnorePingCheck - " + details.url + " : " + ignorePingCheck[details.url]);
    console.log("IP: " + details.ip);
  }*/
  var isDnsSafe = CheckDNS(hostData.host, details.ip);
  //console.log("onResponseStarted - " + details.url + " : " + details.ip);
	if (!isDnsSafe && !ignorePingCheck[details.url]) {
		//console.log("[onResponseStarted] Cancel DNS Rebind Attack for: " + details.url)
		return {
			cancel:true
		};
	}
},
{
 urls: ["<all_urls>"]
},
["responseHeaders"]);

chrome.webRequest.onBeforeRequest.addListener(function (details) {
  var hostData = getHostData(details.url);
	if (!hostData) return;
  if(ignorePingCheck[details.url]){
    //console.log("IgnorePingCheck - " + details.url + " : " + ignorePingCheck[details.url]);
    //console.log("IP: " + details.ip);
    CheckDNS(hostData.host, details.ip);
  }
  //console.log("IgnorePingCheck - " + details.url + " : " + ignorePingCheck[details.url])
  if (cancelRequestsTo[hostData.host] && !ignorePingCheck[details.url]) {
		//console.log("[onBeforeRequest] Cancel DNS Rebind Attack for: " + details.url + " - " + cancelRequestsTo[hostData.host]);
    var url = "http://" + hostData.host +"/";
    ignorePingCheck[url] = true;
    //console.log("[ignorePinchCheck] set for ping url: " + url);
    console.log("[BLOCKED DOMAIN - "+hostData.host+"] - Checking to see if rebind attack is over with url: " + url);
    checkDomain[url] = true;
		return {
			//cancel:true
      redirectUrl : chrome.extension.getURL('blocked.html?fqdn=' + encodeURI(hostData.host) + "&url=" + encodeURI(hostData.host) +"&ip="+ dns[hostData.host] + "&attempt=" + cancelRequestsTo[hostData.host])
		};
	}
}, {
	urls : ["<all_urls>"]
},["blocking"]);

chrome.webRequest.onErrorOccurred.addListener(function (details){
  //console.log("[onErrorOccurred] " + JSON.stringify(details));
  var hostData = getHostData(details.url);
	if (!hostData) return;
  var isDnsSafe = CheckDNS(hostData.host, details.ip);
},
{
 urls: ["<all_urls>"]
});


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    //log.info("URL Sender: " + sender.tab.url);
    //////console.log(request);
    if(request.unblock){
      console.log("[UNBLOCKED DOMAIN] - User initiated unblock of : " + request.unblock);
      delete dns[request.unblock];
      delete cancelRequestsTo[request.unblock];
    }
  }
);
