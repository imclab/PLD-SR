var model = require("./model");

function error(code, resp) {
	var result = {};
	result.error = {};
	result.error.code = code;
	
	switch(code) {
		case 0:
			result.error.msg = "Couldn't parse the JSON";
			break;
		default:
			result.error.msg = "Unknow error";
	}
	
	var jsonResult = JSON.stringify(result);
	resp.end(jsonResult);
}

/*
 * SERVICE Sensors
 * Gets records from sensors, allows to specify an interval.
 */
function serviceSensors(query, post, resp) {
	resp.writeHead(200, {"Content-type" : "application/json"});
	
	// Parse the json request in POST data :
	console.log("POST data : " + post);
	request = JSON.parse(post);
	if(!request) {
		error(0, resp);
		return;
	}
	
	// Get the response from the model layer :
	model.getSensorsRecords(request, function(response) {
		// Send the stringified json to client :
		var strResponse = JSON.stringify(response);
		resp.end(strResponse);
	});
}

/*
 * SERVICE Actuators
 * Allows to pass values to actuators.
 */
function serviceActuators(query, post, resp) {
	resp.writeHead(200, {"Content-type" : "application/json"});
	
	// Parse the json POST request
	request = JSON.parse(post);
	
	var result = {};
	
	var strResult = JSON.stringify(result);
	resp.end(strResult);
}

exports.sensors = serviceSensors;
exports.actuators = serviceActuators;
