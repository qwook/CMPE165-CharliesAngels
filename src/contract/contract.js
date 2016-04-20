FlowRouter.route('/contract/:id', {
    subscriptions: function() {
        this.register('application', Meteor.subscribe('application'));
    },
    action: function (params) {
        FlowRouter.subsReady(function() {
            console.log('TEST TEST');
            // Test application id: DW3dvWg8uBNMidjY
            var application = Application.findOne({_id: params.id});
            
            
            // Given just the application id, we can get the following:
            var service = Services.findOne({_id: application.gigId});
            var musician = Meteor.users.findOne({_id: application.userId});
            var employer = Meteor.users.findOne({_id: service.employer});
            
            console.log(service);
            
            BlazeLayout.render("layout", {
                area: "contractPage",
                employerName: employer.emails[0].address,
                musicianName: musician.emails[0].address,
                service: service,
                params: params
            });
        });
    }
});

// FOR TESTING
FlowRouter.route('/signcontract', {
     subscriptions: function() {
        this.register('services', Meteor.subscribe('services'));
    },
    action: function(params) {
        FlowRouter.subsReady(function() {
            
            console.log('TEST');
            // Testing service
            var service = Services.findOne({_id: "KBex9o9NwsPAPfN3R"});
            console.log(service);
            console.log(service.employer);
            // This will let us know whether it is employer or not.
            // service.isUserEmployer = service.employer === Meteor.userId():
            var employer = Meteor.users.findOne({_id: service.employer});
            
            // fill in later
            BlazeLayout.render("layout", {
                area: "contractPage",
                employerName: employer.emails[0].address,
                musicianName: "musician",
                service: service,
            });
        });
    }
});

if (Meteor.isServer) {
    
    Meteor.methods({
        // Updates services.live to false so that it
        //  is no longer searchable since contract
        //  is finalized once it is signed.
        "finalizeContract": function (mService) {
            return Services.update(mService._id, mService);
        }
    });
    
    //file:/server/init.js
    // setup for uploading pdfs
    Meteor.startup(function () {
        UploadServer.init({
            tmpDir: Meteor.rootPath + '/uploads/tmp',
            uploadDir: Meteor.rootPath + '/uploads',
            checkCreateDirectories: true
        });
    });
}

if (Meteor.isClient) {
    Template.contractPage.events({
        "submit .contract-signature-musician": function () {
            event.preventDefault();
            
            var mService = Services.findOne({_id: this.service()._id});
            mService.signedByMusician = new Date();
            mService.live = false;
            Meteor.call("finalizeContract", mService, function (err) {
                    console.log(err)
            });
        }
    });
}