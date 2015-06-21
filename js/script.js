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
	var query = server + 'www.' + term + '.com';
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

/*
 * Render the comunity with d3.js
 * @param {type} ns	Nodes
 * @param {type} es	Edges
 * @returns {undefined}
 */
function draw(ns, es) {

    console.log("draw/init");
    var community = jLouvain().nodes(ns).edges(es);
//Drawing code

    var width = 1000,
	    height = 1000;
    var original_node_data = d3.entries(ns);
    var max_weight = d3.max(es, function (d) {
	return d.weight
    });
    var weight_scale = d3.scale.linear().domain([0, max_weight]).range([1, 5]);
    // cool random force...
    var force = d3.layout.force()
	    .charge(-30)
	    .linkDistance(20)
	    .size([width, height]);
    var svg = d3.select("body").append("svg")
	    .attr("width", width)
	    .attr("height", height)
	    .attr("border", 1);
    force.nodes(original_node_data)
	    .links(es)
	    .start();
    var link = svg.selectAll(".link")
	    .data(es)
	    .enter().append("line")
	    .attr("class", "link")
	    .style("stroke-width", function (d) {
		return weight_scale(d.weight);
	    });
    var node = svg.selectAll(".node")
	    .data(force.nodes())
	    .enter().append("circle")
	    .attr("class", "node")
	    .attr("r", 5)
	    .style("fill", '#a30500')
	    .call(force.drag);
    force.on("tick", function () {
	link.attr("x1", function (d) {
	    return d.source.x;
	})
		.attr("y1", function (d) {
		    return d.source.y;
		})
		.attr("x2", function (d) {
		    return d.target.x;
		})
		.attr("y2", function (d) {
		    return d.target.y;
		});
	node.attr("cx", function (d) {
	    return d.x;
	})
		.attr("cy", function (d) {
		    return d.y;
		});
    });
    d3.select('#detect').on('click', function () {
	//Communnity detection on click event

	var community_assignment_result = community();
	var node_ids = Object.keys(community_assignment_result);
	console.log('Resulting Community Data', community_assignment_result);
	var max_community_number = 0;
	var maxComunity = 2;
	node_ids.forEach(function (d) {
	    original_node_data[d].community = community_assignment_result[d]; //  asignació binaria
	    // original_node_data[d].community = community_assignment_result[d] % maxComunity; // asignació binaria

	    max_community_number = max_community_number < community_assignment_result[d] ? community_assignment_result[d] : max_community_number;
	});
	console.log(max_community_number);
	console.info("export PAJEK.clu");
	partitionToCluster(community_assignment_result, files[fileIdx] + ".clu");
	var color = d3.scale.category20().domain(d3.range([0, max_community_number]));
	d3.selectAll('.node')
		.data(original_node_data)
		.style('fill', function (d) {
		    return color(d.community);
		})
    });
    d3.select('#reset').on('click', function () {
	d3.selectAll('.node')
		.data(original_node_data)
		.style('fill', '#a30500');
    });
    console.log("draw/end");
}



function mycomparator(a, b) {
    return parseInt(a) - parseInt(b);
}

function predicatBy(prop) {
    return function (a, b) {
	if (a[prop] > b[prop]) {
	    return 1;
	} else if (a[prop] < b[prop]) {
	    return -1;
	}
	return 0;
    }
}
