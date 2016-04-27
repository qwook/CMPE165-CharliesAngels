Contracts = new Mongo.Collection('contracts');

FlowRouter.route('/contract/:id', {
    subscriptions: function() {
        this.register('application', Meteor.subscribe('application'));
    },
    action: function (params) {
        FlowRouter.subsReady(function() {
            console.log('TEST TEST');
            // Test application id: AjvkESAD3RGgN2vdY
            var application = Application.findOne({_id: params.id});
            
            // Given just the application id, we can get the following:
            var service = Services.findOne({_id: application.gigId});
            var employer = Meteor.users.findOne({_id: service.employer});
            var musician = Meteor.users.findOne({_id: application.userId});
            
            
            var contract = Contracts.insert({
                serviceId: service._id,
                applicationId: application._id,
                employerId: employer._id,
                musicianId: musician._id,
                dateSigned: new Date()
            });
            
            console.log(contract);
            
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
            var service = Services.findOne({_id: "BBDKDeFMuZi3Gricv"});
            console.log(service);
            console.log(service.employer);
            // This will let us know whether it is employer or not.
            // service.isUserEmployer = service.employer === Meteor.userId():
            var employer = Meteor.users.findOne({_id: service.employer});
            
            // fill in later
            BlazeLayout.render("layout", {
                area: "contractPage",
                employerName: "employer",
                musicianName: "musician",
                service: null,
            });
        });
    }
});

if (Meteor.isServer) {
    
    Meteor.publish("contracts", function () {
        return Contracts.find({});
    });
    
    Meteor.methods({
        // Updates services.live to false so that it
        //  is no longer searchable since contract
        //  is finalized once it is signed.
        "finalizeContract": function (mService, mContract) {
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
            
            var mContract = Contracts.findOne({_id: this.contract()._id});
            var mService = Services.findOne({_id: this.service()._id});
            mService.signedByMusician = new Date();
            mService.live = false;
            Meteor.call("finalizeContract", mService, mContract, function (err) {
                console.log(err)
            });
        }
    });
}