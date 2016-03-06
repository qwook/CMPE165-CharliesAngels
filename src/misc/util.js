// Drop random utility functions here that don't really belong anywhere else.

/*

	console.log( checkObject({
		title: "string",
		description: "string",
		wage: "number"
	}, {
		title: "hey",
		description: "yo",
		wage: 1234
	}) );
	
*/

function checkObject(scheme, data) {
	for (var key in scheme) {
		if (typeof(data[key]) != scheme[key]) {
			console.log(typeof(data[key]));
			return false;
		}
	}

	return true;
}
