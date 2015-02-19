// window.onload=function(){
// 	console.log("hi");
//   	window._ads2 = window._ads2 || [];
// 	window._ads2.push({
//     	"url": "http://ads.moceanads.com/ad?site=119325&zone=343717&type=-1",
//     	"containerId": 'ads2_container_343717'
// 	});
// }

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

var mocean_response = ""
var test_url = "http://ads.moceanads.com/ad?site=119325&zone=343717&type=-1&ip=173.3.77.115&ua=Mozilla%2F5.0+%28Windows%3B+U%3B+Windows+NT+5.2%3B+ru%3B+rv%3A1.9.0.19%29+Gecko%2F2010031422+Firefox%2F3.0.19+%28.NET+CLR+3.5.30729%29&key=6&jsvar=mocean_response&type=3"

getXHR(test_url, function(data){
	console.log("response:")
	console.log(data);
	console.log(mocean_response);
});
