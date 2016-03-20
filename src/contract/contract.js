services = function () {
	return Services;
}

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
		// Sets the service listing property to false to indiciate
		// that contract has been signed, making service no longer available to search.
		// note: if (live === false) then service should not be returned to search
		"finalizeContract": function(serviceObj) {
			var service = services.find({ title: serviceObj.title });
			service.live = false;
		}
	});
}

if (Meteor.isClient) {
	Template.contractPage.events({
		"submit .contract-signature-employer": function () {
			event.preventDefault();
			
			
		}
	});
}