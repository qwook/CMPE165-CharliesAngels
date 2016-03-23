FlowRouter.route('/', {
    action: function(params) {
        BlazeLayout.render("layout", {area: "index"});
    }
});

FlowRouter.route('/', {
    action: function(params) {
        BlazeLayout.render("layout", {area: "index"});
    }
});

if (Meteor.isClient) {
    Template.layout.events({
        "click .post-a-gig": function (event) {
        },
        "click .profile": function (event) {
        },
        "click .logout": function(event) {
            event.preventDefault();
            Meteor.logout();
        }
    });

    Template.contractPage.helpers({
        "services": function() {
            return Services.find({});
        }
    });

    Template.index.helpers({
        "services": function() {
            return Services.find({});
        },

    });

    Template.layout.helpers({
        "notifications": function() {
            // Return all notifications for the current user
            return Notification.find({userId: Meteor.userId()});
        },

    });
}
