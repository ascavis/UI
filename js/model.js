var model = null;

var camera, scene;
var geometry, material, mesh;

function main() {
	jQuery.getJSON( "http://127.0.0.1:5000/model", function(data) {
	 	initializeModel(data); 
	 } )
	
	var timer = $.timer(function() {
	    updateModel(new Date());
	    drawModel();
	    lighting();
	});
	timer.set({ time : 1000, autostart : true });
}

function initializeModel(data) {
	model = data;
}

function updateModel(date) {
	if(model == null) return;
	 
	$.each(model, function(index,value) {
		var request = new Object();
		request.line1 = value.tle[0].line1;
		request.line2 = value.tle[0].line2;
		request.year = date.getFullYear();
		request.month = date.getMonth()+1;
		request.day = date.getDate();
		request.hour = date.getHours();
		request.minute = date.getMinutes();
		request.second = date.getSeconds();
		
		$.ajax({
		    type: 'POST',
		    // Provide correct Content-Type, so that Flask will know how to process it.
		    contentType: 'application/json',
		    // Encode your data as JSON.
		    data: JSON.stringify(request),
		    // This is the type of data you're expecting back from the server.
		    dataType: 'json',
		    url: 'http://127.0.0.1:5000/calculate',
		    success: function (a) {
		    	var response = a;
		        value.position = response.position;
		        value.velocity = response.velocity;
		        value.updated = true;
		    }
		});
	} );
}

