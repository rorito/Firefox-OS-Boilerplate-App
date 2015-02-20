FlurryAgent.startSession("KDWDFV7VDVDPVMQMS89X");

FlurryAgent.setUserId(1);
console.log("foo");
FlurryAgent.logEvent("foo");






function getXHR(url, callback) {
    var xhr = new XMLHttpRequest();       // Creates a new XHR request
 
    if (!url) {
        throw new Error('No URL supplied');
    }
 
    xhr.open("GET", url, true);         // Open the connection
 
    xhr.setRequestHeader("Content-type",
        "text/plain; charset=utf-8;");
 
    xhr.withCredentials = "true";        // This sends cookies through 
 
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {      // If the response has finished downloading
            if(xhr.status === 200){      // And the content was found
                try {
                    if (callback) {
                        callback(null, JSON.parse(xhr.responseText));
                    }
                } catch(e){
                    throw new Error('Malformed response');
                }
            }
        }
    }
 
    xhr.send();                          // Makes the request
}
