
FlowRouter.route('/', {
	action: function(params) {
		BlazeLayout.render("layout", {area: "index"});
	}
});

if (Meteor.isClient) {
	Template.layout.events({
		"click .post-a-gig": function(event) {

		},
		"click .logout": function(event) {
			event.preventDefault();

			Meteor.logout();
		}
	});

	Template.index.helpers({
		"services": function() {
			return Services.find({});
		}
	})
}