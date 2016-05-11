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
            console.log(application.wage);
            // Given just the application id, we can get the following:
            var service = Services.findOne({_id: application.gigId});
            var employer = Meteor.users.findOne({_id: service.employer});
            var musician = Meteor.users.findOne({_id: application.userId});
           
            console.log(service.employer);
            console.log(Meteor.userId());
            var isEmployer = (service.employer === Meteor.userId());

            // Update application wage if visitng contract for first time
            // application.acceptedByEmployer = true;
            // if (!application.wage) {
            //     application.wage = service.wage;
            // }
            
            // Meteor.call("updateApp", application, function(err) {
            //     if (err) {
            //         console.log('Error updating application in contract.js');
            //         console.log(err);
            //     }
            // });

            // var contract = Contracts.insert({
            //     serviceId: service._id,
            //     applicationId: application._id,
            //     employerId: employer._id,
            //     musicianId: musician._id,
            //     dateSigned: new Date()
            // });
            
            
            BlazeLayout.render("layout", {
                area: "contractPage",
                employerName: employer.emails[0].address,
                musicianName: musician.emails[0].address,
                service: service,
                application: application,
                userId: Meteor.userId(),
                params: params,
                isEmployer: isEmployer
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
        // Updates service.live to false so that it
        //  is no longer searchable since contract
        //  is finalized once it is signed.
        "finalizeContract": function (mService) {
            return Services.update(mService._id, mService);
        },
        "updateApp": function (mApplication) {
            var application = Application.findOne({_id: mApplication._id});

            if (mApplication.wage) {
                Services.update({_id: application.gigId}, {$set: {wage: mApplication.wage}});
            }
            return Application.update(mApplication._id, mApplication);
        },
        "uploadTermsOfService": function(appId, url) {
            Application.update({_id: appId}, {$set: {tosUrl: url}});
        }
    });
    
    //file:/server/init.js
    // setup for uploading pdfs
    Meteor.startup(function () {
        UploadServer.init({
            tmpDir: Meteor.rootPath + '/uploads/tmp',
            uploadDir: Meteor.rootPath + '/uploads',
            checkCreateDirectories: true,
            getDirectory: function(fileInfo, formData) {
                return formData.contentType;
            },
            finished: function(fileInfo, fileData) {
                // How to associate with contract?
            }
        });
    });
}

if (Meteor.isClient) {

    Template.contractPage.helpers({
        "employer": function() {
            return Meteor.users.findOne({_id: this.service().employer});
        },

        "musician": function() {
            return Meteor.users.findOne({_id: this.application().userId});
        },

        "uploadCallbacks": function() {
            var _this = this;
            return {
                finished: function(index, fileInfo, context) {
                    var url = fileInfo.baseUrl + fileInfo.path.replace("/", "");
                    Meteor.call("uploadTermsOfService", _this.application()._id, url);
                }
            }
        },

        "applicationSync": function() {
            return Application.findOne({_id: this.application()._id});
        }
    })

    Template.contractPage.events({
        "click .contract-remove-tos": function() {
            Meteor.call("uploadTermsOfService", this.application()._id, null);
        },

        "submit .contract-signature-musician": function (event) {
            event.preventDefault();

            // var mContract = Contracts.findOne({_id: this.contract()._id});
            var mService = Services.findOne({_id: this.service()._id});
            mService.signedByMusician = new Date();
            mService.live = false;

            var mApplication = this.application();

            Meteor.call("finalizeContract", mService, function (err) {
                if (err) {
                    console.log("Error updating service in contract.js");
                }
            });

            FlowRouter.go('/payment/' + mApplication._id);
        },
        "submit .contract-signature-employer": function (event) {
            event.preventDefault();
            
            // var mContract = Contracts.findOne({_id: this.contract()._id});
            var mService = Services.findOne({_id: this.service()._id});
            var application = Application.findOne({_id: this.application()._id});
            mService.signedByEmployer = new Date();
            mService.live = false;
            
            Meteor.call("finalizeContract", mService, function (err) {
                if (err) {
                    console.log("Error finalizing contract in contract.js");
                }
            });

            console.log("created notification", {
                    from: mService.employer,
                    gigId: mService._id,
                    // contract: mContract._id,
                    application: application._id
                });
            Meteor.call("createNotification", {
                // The creator of the service is the one who needs to be notified
                userId: application.userId,
                // The notification object can be used for various things but in this
                // case we're telling the employer someone applied for this service
                type: "notificationContractSent",
                templateData: {
                    from: mService.employer,
                    gigId: mService._id,
                    // contract: mContract._id,
                    application: application._id
                },
                read: false
            }, function() {
                alert("Successfully sent contract!");
            });
        },
        // Shows form to edit wage
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
        // Submits form to edit wage
        "submit .contract-edit-wage-submit": function (event) {
            event.preventDefault();
            
            var mApplication = this.application();
            mApplication.wage = event.target.serviceWage.value;
            mApplication.editingWage = false;
            mApplication.waitingOnEmployer = true;
            
            Meteor.call("updateApp", mApplication, function (err) {
                if (err) {
                    console.log("Error update application in contract.js");
                    console.log(err);
                }
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