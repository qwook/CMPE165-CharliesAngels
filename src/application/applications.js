Application = new Mongo.Collection("application");

FlowRouter.route('/myApplications', {
    action: function (params) {
        BlazeLayout.render("layout", {
            area: "myApplications",
            params: params
        });
    }
});

FlowRouter.route('/gig/:gigId/gigApplications/', {
    action: function (params) {
        BlazeLayout.render("layout", {
            area: "gigApplications",
            params: params
        });
    }
});

if (Meteor.isServer) {
    Meteor.methods({
        "createApplication": function (applicationObj) {
            var existing = Application.find(applicationObj);
            if(existing.fetch().length > 0) 
                throw new Meteor.Error("existing-application", "A user is applyng twice to the same gig.");
            
            var newApplication = Application.insert({
                //user that is applying for position
                userId: applicationObj.userId,
                //gig id that the application is for
                gigId: applicationObj.gigId,
                //employer id...maybe
                //file upload

                //new, processing ,accepted, or declined
                status: "new"
            });
            return newApplication;
        }
    });
}

if (Meteor.isClient) {
    Template.myApplications.helpers({
        "applications": function () {
            var applications = Application.find({userId: Meteor.userId()});
            //forcibly mapping relationships
            //this attaches the gig to the application so you can use things like title, employerName, etc.
            var mapped = applications.map(function(application, index){
                application.gig = Services.findOne({_id: application.gigId});
  
                return application;
            })
            return mapped ;
        }

    });
    
    Template.gigApplications.helpers({
        "gigApplications": function () {
            var gigApplications = Application.find({userId: Meteor.userId()});
            //forcibly mapping relationships
            //this attaches the gig to the application so you can use things like title, employerName, etc.
            var mapped = gigApplications.map(function(application, index){
                application.gig = Services.findOne(application.gigId);
  
                return application;
            })
            return mapped ;
        }

    });
    
    Template.gigApplications.events({
        "click #chooseApplicant": function(event){
            event.preventDefault();
            event.target.innerHTML = "...";
            var applicationId = event.target.dataset.applicationId;
            //change status to processing of the chosen app, the button will go to the contract page
           Application.update(applicationId,{status: "processing"}, function(){
               // hey go to asdf
               window.location = event.target.href;
           });
        }
        
    });
}