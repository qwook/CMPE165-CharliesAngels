Contracts = new Mongo.Collection("contracts");

FlowRouter.route('/signcontract', {
	action: function(params) {
		BlazeLayout.render("layout", {area: "contractPage"});
	}
});

if (Meteor.isServer) {
	
	Meteor.publish("contracts", function() {
		return Contracts.find({});
	});
	
	
	Meteor.methods({
		"finalizeContract": function(serviceObj) {
			if (!this.userId) {
				console.log("Error: Not logged in");
				return false;
			}
			
			serviceObj.live = false;
		},
		
	});

}



if (Meteor.isClient) {
	
}