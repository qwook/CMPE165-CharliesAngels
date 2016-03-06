
Services = new Mongo.Collection("services");

FlowRouter.route('/gig/:id', {
	action: function(params) {
		var service = Services.findOne({_id: params.id});

		console.log(service);

		BlazeLayout.render("layout", {
			area: "serviceListingPage",
			params: params,
			service: service
		});
	}
});

FlowRouter.route('/postgig', {
	action: function(params) {
		BlazeLayout.render("layout", {area: "servicePostForm"});
	}
});

if (Meteor.isServer) {

	Meteor.publish("services", function () {
		return Services.find({});
	});

	Meteor.methods({
		"createService": function(serviceObj) {
			if (!this.userId) {
				console.log("not logged in");
				return false;
			}

			if (!serviceObj) {
				console.log("no service obj");
				return false;
			}

			if (typeof(serviceObj.title) != "string" || serviceObj.title.length == 0) {
				console.log("no title");
				return false;
			}

			if (typeof(serviceObj.description) != "string" || serviceObj.description.length == 0) {
				console.log("no descript");
				return false;
			}

			if (typeof(serviceObj.wage) != "number" || (new String(serviceObj.wage)).length == 0) {
				console.log("no wage");
				return false;
			}

			var newService = Services.insert({
				employer: this.userId,
				title: serviceObj.title,
				description: serviceObj.description,
				wage: serviceObj.wage,
			});

			return newService;
		}
	});

}

if (Meteor.isClient) {

	Meteor.subscribe("services");

	Template.servicePostForm.events({
		"input #serviceWage": function(event) {
			event.target.value = event.target.value.replace(/[^0-9.]+/g, "");
		},

		"submit .servicePostForm": function() {
			event.preventDefault();

			Meteor.call("createService", {
				title: event.target.serviceTitle.value,
				description: event.target.serviceDescription.value,
				wage: parseFloat(event.target.serviceWage.value)
			}, function(err, id) {
				if (id) {
					FlowRouter.go("/gig/" + id);
				} else {
					console.log("Failure! Handle this!");
				}
			});

		}
	});

}
