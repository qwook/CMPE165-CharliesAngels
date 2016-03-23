services = function () {
    return Services;
}

FlowRouter.route('/signcontract', {
    action: function(params) {
        // fill in later
        BlazeLayout.render("layout", {
            area: "contractPage",
            employerName: "employer",
            musicianName: "musician",
            serviceTitle: "serviceTitle",
            serviceDescription: "description",
            servicePay: "1000"
        });
    }
});

if (Meteor.isServer) {
    
    Meteor.publish("contracts", function() {
        return Contracts.find({});
    });
    
    Meteor.methods({
        // Sets the service listing property to false to indiciate
        // that contract has been signed, making service no longer available to search.
        // note: if (live === false) then service should not be returned to search
        "finalizeContract": function(serviceObj) {
            var service = services.find({ title: serviceObj.title });
            service.live = false;
        }
    });
    
    //file:/server/init.js
    // setup for uploading pdfs
    Meteor.startup(function () {
        UploadServer.init({
            tmpDir: '/Users/tomi/Documents/Uploads/tmp',
            uploadDir: '/Users/tomi/Documents/Uploads/',
            getDirectory: function(file, formData) {
                return formData.contentType;
            },
            finished: function(file, folder, formFields) {
                console.log('Write to database: ' + folder + '/' + file);
            }
        })
    });
}

if (Meteor.isClient) {
    Template.contractPage.events({
        "submit .contract-signature-employer": function () {
            event.preventDefault();
            var service = services.find({}); // fill in later
            
            service.signedByEmployer = new Date();
            if (service.signedByMusician) {
                service.live = false;
            }
        },
        "submit .contract-signature-musician": function () {
            event.preventDefault();
            var service = services.find({}); // fill in later
            
            service.signedByMusician = new Date();
            if (service.SignedByEmployer) {
                service.live = false;
            }
        }
    });
}