var walk = require('walk');
var fs = require('fs');
var readline = require('readline');
var lineReader = require('line-reader');
var files = [];

var tweets = {
    // each is a entity
};


var walker = walk.walk('source', {followLinks: false});


walker.on('file', function (root, stat, next) {
    // Add this file to the list of files
    var filePath = root + '/' + stat.name;
    files.push(filePath);

    var profile = stat.name.split('_')[0];

    tweets[profile] = {
	// each entity has a stack of:
	hashtags: {}, // each hastag has hits, key & hit
	profiles: {} // each profile has hits, key & hit
    };

    // handle the file and
    lineReader.eachLine(filePath, function (line, last) {
	//console.log(line);

	var text = line.substring(39);

	var reHashtag = /#\w+/g;
	var reProfile = /@\w+/g;
	var result;

	result = text.match(reHashtag);
	if (result)
	    result.map(function (elem) {
		var item = elem.substring(1);
		if (tweets[profile].hashtags[item] === undefined)
		    tweets[profile].hashtags[item] = 1;
		else
		    tweets[profile].hashtags[item]++;
	    });

	result = text.match(reProfile);
	if (result)
	    result.map(function (elem) {
		var item = elem.substring(1);
		if (tweets[profile].profiles[item] === undefined)
		    tweets[profile].profiles[item] = 1;
		else
		    tweets[profile].profiles[item]++;
	    });

	// do whatever you want with line...
	if (last) {
	    console.log(last + '/OK');
	    // console.log(JSON.stringify(tweets, 0, 2, null));
	    // or check if it's the last one
	    // write back to file as json
	    outputPath = 'output/out.json';
	    fs.unlink(outputPath, function (err) {
		if (err)
		    console.log(err);
	    });
	    fs.writeFile(outputPath, JSON.stringify(tweets, 0, 2, null), function (err) {
		if (err) {
		    console.log("ERROR save File!");
		}
		console.log("FileSave/OK");
	    });


 

	}
    });




    next();
});

walker.on('end', function () {
    console.log(files);
});