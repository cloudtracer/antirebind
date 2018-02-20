function parse_query_string(query) {
  var vars = query.split("&");
  var query_string = {};
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
      // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
      query_string[pair[0]] = arr;
      // If third or later entry with this name
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  }
  return query_string;
}

var enter_url = window.location.href;
var bits = enter_url.split("?");
if(bits && bits.length){
  var url_params = bits[1];
  console.log("Enter url: " + enter_url)
  var params = parse_query_string(url_params);
  console.log(JSON.stringify(params));
  if(params){
    var elem = document.getElementById('fqdn');
    elem.innerHTML = "Source FQDN: " + params.fqdn;
    elem = document.getElementById('ip');
    elem.innerHTML = "Original IP: " + params.ip;
    elem = document.getElementById('url');
    elem.innerHTML = "Triggered URL: " + params.url;
    elem = document.getElementById('attempt');
    elem.innerHTML = "Attempted IP: " + params.attempt;
    elem = document.getElementById('report');
    elem.href = 'https://safebrowsing.google.com/safebrowsing/report_badware/?referrer=antirebind&url=' + encodeURI(params.url);
    var unblock = document.getElementById('unblock');
    unblock.onclick = function(){
      chrome.runtime.sendMessage({"unblock": params.fqdn}, function(response){
        alert("Successfully unblocked");
      })
    };
  }


}
