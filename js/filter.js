var minYear;
var maxYear;

function filterSetUp() {
	  $( "#slider-range" ).slider({
	    range: true,
	    min: 1960,
	    max: 2020,
	    values: [ 1990, 2014 ],
	    slide: function( event, ui ) {
	     	$( "#minYear" ).text( "$" + $( "#slider-range" ).slider( "values", 0 ));
	     	$( "#maxYear" ).text( "$" + $( "#slider-range" ).slider( "values", 1 ));
	    }
	 });
	 
	 $( "#minYear" ).val( "$" + $( "#slider-range" ).slider( "values", 0 ));
	 $( "#maxYear" ).val( "$" + $( "#slider-range" ).slider( "values", 1 ));
}

function filter(object) {
	if(object.launchDate > minYear && object.launchDate < maxYear) return true;
	else return false;
}