Services = function () {
    return Services;
}

Applications = function () {
    return Application;
}

FlowRouter.route('/contract/:id', {
    subscriptions: function() {
        this.register('application', Meteor.subscribe('application'));
    },
    action: function (params) {
        FlowRouter.subsReady(function() {
            var application = Applications.findOne({_id: params._id});
            console.log('TEST');
            // Test application id: vRTYxj2m6fwircSfB
            
            // Given just the application id, we can get the following:
            var service = Services.findOne({_id: application.gigId});
            var musician = Meteor.users.findOne({_id: application.userId});
            var employer = Meteor.users.findOne({_id: service.employer});
            
            BlazeLayout.render("layout", {
                area: "contractPage",
                employerName: employer.emails[0].address,
                musicianName: musician.emails[0].address,
                service: service,
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
    //file:/server/init.js
    // setup for uploading pdfs
    Meteor.startup(function () {
        UploadServer.init({
            tmpDir: '/Users/Johnny/Documents/GitHub/CMPE165-CharliesAngels/uploads/tmp',
            uploadDir: '/Users/Johnny/Documents/GitHub/CMPE165-CharliesAngels/uploads',
            checkCreateDirectories: true
//            getDirectory: function(file, formData) {
//                return formData.contentType;
//            },
//            finished: function(file, folder, formFields) {
//                console.log('Write to database: ' + folder + '/' + file);
//            }
        });
    });
}

if (Meteor.isClient) {
    
    Template.contractPage.events({
        "submit .contract-signature-musician": function () {
            event.preventDefault();
            var mService = this.service();
            mService.signedByMusician = new Date();
            if (mservice.SignedByEmployer) {
                service.live = false;
            }
        }
    });
}