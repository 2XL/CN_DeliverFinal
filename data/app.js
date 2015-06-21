/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var https = require('https');
var querystring = require('querystring');
var mkdirp = require('mkdirp');
var fs = require('fs');
var rimraf = require('rimraf');
var ncp = require('ncp');



var session = new Date().getTime();
console.log("Start");





var data_source =
	[
	    "ahorapodemos",
	    "compromis",
	    "omnium",
	    "cupnacional",
	    "PPopular",
	    "ERC",
	    "PSOE",
	    "CiudadanosCs",
	    "ForoAsturias",
	    "UPyD",
	    "ciu",
	    "geroabai",
	    "viacatalana",
	    "ciutadans",
	    "iunida",
	    "coalicion",
	    "obloque"
	];

 

// twitter credentials

credentials = {
    csecret: '0PpEYUMdjTLXqSigZlfVzHqtXvYGxKj1uPRza8V8ZcyhH5IhgO',
    ckey: '3tqQRFtQuHktIdu51c4yLjG9d',
    owner: 'torrentjs',
    ownerid: '869690480'
};

var accessToken;
function getAccessToken(cb) {
    if (accessToken)
	return cb(accessToken);

    var bearerToken = Buffer(
	    encodeURIComponent(credentials.ckey) + ':' +
	    encodeURIComponent(credentials.csecret)
	    ).toString('base64');

    var options = {
	hostname: 'api.twitter.com',
	port: 443,
	method: 'POST',
	path: '/oauth2/token?grant_type=client_credentials',
	headers: {
	    'Authorization': 'Basic ' + bearerToken
	}
    };


    https.request(options, function (res) {
	var data = '';
	res.on('data', function (chunk) {
	    data += chunk;
	});
	res.on('end', function () {
	    var auth = JSON.parse(data);
	    if (auth.token_type !== 'bearer') {
		console.log('Twitter auth failed.');
		return;
	    }
	    accessToken = auth.access_token;
	    cb(accessToken);
	});
    }).end();
}

twitterAPI = {
    // gives the ability to search tweets
    /**
     * This search uses twitter REST API
     * @param query: hash tags, #mention
     * @param count: num results, top #
     * @param cb: callback function
     */
    search: function (query, count, cb) {
	getAccessToken(function (accessToken) {
	    var options = {
		hostname: 'api.twitter.com',
		port: 443,
		method: 'GET',
		path: '/1.1/search/tweets.json?q=' +
			encodeURIComponent(query) +
			'&count=' + (count || 10),
		headers: {
		    'Authorization': 'Bearer ' + accessToken
		}
	    };
	    https.request(options, function (res) {
		var data = '';
		res.on('data', function (chunk) {
		    data += chunk;
		});
		res.on('end', function () {
		    cb(JSON.parse(data));
		});
	    }).end();
	});
    }
};

var q = {
    query: "#" + "viacatalana",
    count: 100 // maximum
};

mkdirp(session.toString(), function (msg) {
    console.log("Session Folder created!!!");
    // path was created unless there was error

});



var itvIdx = 0;
data_source.forEach(function (q) {
    var query = '#' + q;
    twitterAPI.search(query, 100, function (data) {
	// console.log(data);
	if (data.statuses === undefined) {
	    console.log("No Result");
	} else {
	    fs.writeFile(session + '/' + query.substring(1) + '.json', JSON.stringify(data.statuses, 0, 2, null), function (msg) {
		console.log(query + "/OK");

	    });
	}
	itvIdx++;
    });
});


var iterTime = 0;

var itvTimer = setInterval(function () {

    if (itvIdx === data_source.length || iterTime > 20) {
	updateLatest();
	clearInterval(itvTimer); 
    } else {
	console.log("Still Loading Tweets... " + itvIdx + '/' + data_source.length);
    }

    iterTime++;
}, 500);

// write back dataset index 

function updateLatest() {
    fs.writeFile(session + '/index.js', 'data_source = ' + JSON.stringify(data_source) + ', session = ' + session + ';', function (msg) {
	console.log("Index write back /OK");

// remove the previous latest
	rimraf('latest', function (err) {
	    if (err) {
		throw err;
	    }
	    console.log("deleted prev version...");
	    // copy the current latest
	    ncp(session.toString(), 'latest', function (err) {
		if (err) {
		    throw err;
		}
		console.log("latest version updated!");
		// done
	    });
	});
    });
}




 