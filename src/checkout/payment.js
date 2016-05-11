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
                service: service,
                params: params
            });
        });
    }
});