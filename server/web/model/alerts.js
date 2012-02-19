var squel = require("squel");
var sql = require("./nodesql");

function sqlConnect() {
	return sql.createClient("localhost", "rithm", "rithm", "pld");
}

/*
 * REQUEST :
 * ============================================================================
{
	“from” : “yyyy/MM/dd HH:mm:ss”,
	“to” : “yyyy/MM/dd HH:mm:ss”
}
 * ============================================================================
 *
 * RESPONSE :
 * ============================================================================
{
	“alerts” : [
		{
			“time” : “yyyy/MM/dd HH:mm:ss”,
			"name" : "patient convulse",
			“sensors" : [
				{
					"id" : 123,
					"type" : 12,
					"isGlobal" : true,
					"..." : 1
				}
			]
		}
	]
}
 * ============================================================================
 */
function getAlerts(param, callback) {

	var from = Date.parse(param.from);

	// Construct the SQL query :
	var sql_req = squel.select()
		.from("alertes", "a")
		.join("regles", "r", squel.expr().and("r.id = a.idRegle"))
		.field("a.time", "time")
		.field("r.id", "id")
		.field("r.nom", "name");
	var cond = squel.expr()
		.and("a.time > "+from*1000);
	if(param.to) {
		var to = Date.parse(param.to);
		cond.and("a.time < "+to*1000);
	}
	sql_req.where(cond);
	
	// Send the query to SQL DB :
	var db = sqlConnect();
	sql.query(db, sql_req.toString(), function(result) {
		console.log("A Took : "+result.took+"ms - Hits : "+result.count);
		
		// Construct json response :
		var response = {};
		response.alerts = [];
		
		var nbResponseReceived = 0;
		for(var i in result.hits) {
			var hit = result.hits[i];
			var _alert = {};
			_alert.time = hit["time"];
			_alert.name = hit["name"];
			_alert.sensors = [];
			
			// Construct second SQL query :
			if(!hit.id)
				console.log("BAAAA");
			sql_req = squel.select()
				.from("capteurs")
				.where("id IN ("+squel.select()
					.field("idCapteur")
					.from("regleCapteur")
					.where("idRegle = "+hit.id).toString()
					+")");

			sql.query(db, sql_req.toString(), function(result2) {
				console.log("Took : "+result2.took+"ms - Hits : "+result2.count);
				
				for(var j in result2.hits) {
					_alert.sensors.push(result2.hits[j]);
				}

				// Add the alert to the result :
				response.alerts.push(_alert);

				nbResponseReceived++;
				// For the last alert :
				console.log(nbResponseReceived + " " + result.count);
				if(nbResponseReceived === (result.count - 1)) {
					// Call the record with json response :
					callback(response);
					sql.close(db);
				}
				
			});
		}
	});

}

exports.getAlerts = getAlerts;
