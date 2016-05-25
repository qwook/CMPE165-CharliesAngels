FlowRouter.route('/', {
    action: function (params) {
        //var categorySelected = Meteor.findOne().category;
        BlazeLayout.render("layout", {
            area: "index" });
    }
});


if (Meteor.isClient) {

   

    Template.layout.events({
        "click .post-a-gig": function (event) {
        },
        "click .profile": function (event) {
        },
        "click .logout": function (event) {
            event.preventDefault();
            Meteor.logout();
        },

        "click .sign-in-fb": function(e) {
            Meteor.loginWithFacebook();
            e.preventDefault();
        }
      
   
    });


    Template.contractPage.helpers({
        "services": function () {
            return Services.find({});
        }
    });





    Template.layout.helpers({
        "notifications": function () {
            // Return all notifications for the current user
            
            return Notification.find({userId: Meteor.userId()});
        },
    });

}
