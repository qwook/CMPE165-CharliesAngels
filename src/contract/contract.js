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
            
            
            application.acceptedByEmployer = true;
            application.wage = service.wage;
            
            this.Meteor.call("updateApp", application, function (err) {
                console.log("Error updating application in contract.js");
                console.log(err);
            });

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
                application: application,
                params: params
            });
        });
    }
});


if (Meteor.isServer) {
    
    Meteor.publish("contracts", function () {
        return Contracts.find({});
    });
    
    Meteor.methods({
        // Updates service.live to false so that it
        //  is no longer searchable since contract
        //  is finalized once it is signed.
        "finalizeContract": function (mService) {
            return Services.update(mService._id, mService);
        },
        "updateApp": function (mApplication) {
            return Application.update(mApplication._id, mApplication);
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
            Meteor.call("finalizeContract", mService, function (err) {
                console.log("Error updating service in contract.js");
            });
        },
        "click .contract-edit-wage": function (event) {
            event.preventDefault();
            
            var mApplication = this.application()
            mApplication.editingWage = true;
            mApplication.acceptedByEmployer = false;
            
            BlazeLayout.render("layout", {
                area: "contractPage",
                employerName: this.employerName(),
                musicianName: this.musicianName(),
                service: this.service(),
                application: mApplication,
                params: this.params()
            });
        },
        "submit .contract-edit-wage-submit": function (event) {
            event.preventDefault();
            
            var mApplication = this.application();
            mApplication.wage = event.target.serviceWage.value;
            mApplication.editingWage = false;
            mApplication.waitingOnEmployer = true;
            
            Meteor.call("updateApp", mApplication, function (err) {
                console.log("Error updating application in contract.js");
                console.log(err);
            });
                        
            BlazeLayout.render("layout", {
                area: "contractPage",
                employerName: this.employerName(),
                musicianName: this.musicianName(),
                service: this.service(),
                application: mApplication,
                params: this.params()
            });
        },
    });
}