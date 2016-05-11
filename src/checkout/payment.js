FlowRouter.route('/payment/:id', {
    subscriptions: function() {
        this.register('application', Meteor.subscribe('application'));
    },
    action: function (params) {
        FlowRouter.subsReady(function() {
            // Test id: /payment/GFrMEiAzG4eb2dBrg
            var application = Application.findOne({_id: params.id});
            var service = Services.findOne({_id: application.gigId});

            BlazeLayout.render("layout", {
                area: "paymentPage",
                application: application,
                appId: params.id,
                service: service,
                params: params
            });
        });
    }
});

if (Meteor.isServer) {
    Meteor.methods({
        "paid": function(id) {
            var application = Application.findOne({_id: id});
            console.log(application);
            console.log(id);
            Application.update({_id: id}, {$set: {paid: true}});
        }
    })
}

if (Meteor.isClient) {
    Template.paymentPage.events({
        "submit #payment-form": function(e) {
            e.preventDefault();

            var appId = this.appId();
            Meteor.call("paid", appId, function() {
                FlowRouter.go("/myApplications/" + appId);
            });
        }
    })
}