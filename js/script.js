/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

console.log("script Loaded!");


console.log("LOCAL STORAGE");

var version = new Date().getDay();
if (localStorage['extension-version'] !== version) {
    localStorage.clear();
    localStorage['extension-version'] = version;
}


function pajekToJSON(str) {

    console.log({data: str});
    var list = str.split("\n");
    var json = {};
    var section = "";
    var patt = /^[0-9]/; // start with a number
    for (var key in list) {
	if (list[key].trim().search(patt) !== -1) {
	    // console.log(list[key])
	    var line = list[key].match(/\S+/g);
	    switch (section) {
		case "Vertices":
		    json[section].push(parseInt(line[0]) - 1); // offset -1 xk incia amb 0
		    break;
		case "Edges":
		    var edge = {
			source: parseInt(line[0]) - 1, // offset -1 xk incia amb 0
			target: parseInt(line[1]) - 1,
			weight: parseInt(line[2])
		    };
		    json[section].push(edge);
		    //    console.log(edge);
		    break;
		default :
		    console.log("unhandled: " + section);
		    break;
	    }
	} else {
	    // console.info({data: list[key]});
	    if (list[key] !== "") {
		section = list[key].match(/[A-z]+/)[0];
		console.log({data: section});
		console.log(json);
		json[section] = [];
	    }

	}
    }



// dir is the path of the file.net


    return json;
// format
// param -> values 
}

// haha aixo o Jquery en una linea...
function loadJSON(path, callback) {

    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', path, true);
    xobj.onreadystatechange = function () {
	if (xobj.readyState === 4 && xobj.status === 200) {
// .open will NOT return a value but simply returns undefined in async mode so use a callback
	    callback(xobj.responseText);
	}
    }
    xobj.send(null);
}


function loadNET(path, callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/plain");
    xobj.open('GET', path, true);
    xobj.onreadystatechange = function () {
	if (xobj.readyState === 4 && xobj.status === 200) {
// .open will NOT return a value but simply returns undefined in async mode so use a callback
	    callback(xobj.responseText);
	}
    }
    xobj.send(null);
}


function isJson(str) {
    try {
	var data = JSON.parse(str);
    } catch (e) {
	return {json: false, data: str};
    }
    return {json: true, data: data};
}


function makeArrayOf(length, value) {
    var arr = [], i = length;
    if (value === undefined) {
	while (i--) {
	    arr[i] = i;
	}
    } else {
	while (i--) {
	    arr[i] = value;
	}
    }
    return arr;
}



/**
 * list es un array de strings
 */
function parseDMOZ(list, callback) {
    var result = [];

 
    for (var text in list) {
	// console.log(domain);
	var server = "http://dmoz-api.appspot.com/category?url=";
	var search = "http://www.dmoz.org/search?q="




	var term = list[text];
	var query = server + 'www.'+term+'.com';
//	var querySearch = search + term;
	// and remember the jqXHR object for this request


	console.log(query);

	$.ajax({
	    crossDomain: true,
	    type: "GET",
	    url: query
	}).done(function (data) {
	    result.push(data);
	});
	// es llançen els queries i jasta
    }



    var itvParse = setInterval(function () {
	if (result.length === list.length) {
	    console.log("parseDMOZ: Completed!");
	    console.log(result);
	    callback(result);
	    clearInterval(itvParse);

	} else {
	    console.log("parseDMOZ: " + result.length + '/' + list.length);
	}
    }, 500);

}
