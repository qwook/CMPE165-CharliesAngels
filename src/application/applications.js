Application = new Mongo.Collection("application");

FlowRouter.route('/myApplications', {
    action: function (params) {
        var service = Services.findOne({_id: params.gigId});
        BlazeLayout.render("layout", {
            area: "myApplications",
            params: params,
            service: service
        });
    }
});
FlowRouter.route('/editApplication/:id', {
    subscriptions: function () {
        this.register('application', Meteor.subscribe('application'));
    },
    action: function (params) {
        FlowRouter.subsReady(function () {
            var service = Services.findOne({_id: params.gigId});

            BlazeLayout.render("layout", {
                area: "editApplication",
                params: params,
                service:service
            });
        });
    }
});
//Page for applying to a gig
FlowRouter.route('/apply/:id', {
    action: function (params) {

        //making space if needing functions here
        var service = Services.findOne({_id: params.id});
        service = service || {}
        var employer = Meteor.users.findOne({_id: service.employer});

        BlazeLayout.render("layout", {
            area: "applyForm",
            params: params,
            service: service,
            employer: employer
        });
    }
});
//page for vewing a specific gig's applications
FlowRouter.route('/gig/:gigId/gigApplications/', {
    action: function (params) {
        var service = Services.findOne({_id: params.gigId});
        var applications = Application.find({gigId: params.gigId, status: {$not: "declined"}}).fetch();

        BlazeLayout.render("layout", {
            area: "gigApplications",
            params: params,
            service: service,
            applications: applications
        });
    }
});
//page for viewing an application
FlowRouter.route('/application/:id', {
    action: function (params) {
        
        var service = Services.findOne({_id: params.gigId});
        var application = Application.findOne({_id: params.id});

        BlazeLayout.render("layout", {
            area: "applicationPage",
            params: params,
            service: service,
            application: application
            
        });
    }
});
if (Meteor.isServer) {

    Meteor.publish("application", function () {
        return Application.find({});
    });

    Meteor.methods({
        "createApplication": function (applicationObj) {
            var existing = Application.find({userId: applicationObj.userId, gigId: applicationObj.gigId});
            if (existing.fetch().length > 0)
                throw new Meteor.Error("existing-application", "A user is applyng twice to the same gig.");

            var newApplication = Application.insert({
                //user that is applying for position
                userId: applicationObj.userId,
                //gig id that the application is for
                gigId: applicationObj.gigId,
                //description of qualifications
                description: applicationObj.description,
                //file upload

                //new, processing ,accepted, or declined
                status: "new",
                //date the application was sent in at
                dateCreated: applicationObj.dateCreated
            });
            return newApplication;
        },
        "updateApplication": function(id, applicationObj){
            if (Meteor.userId()==null) {
                console.log("not logged in");
                return false;
            }

            if (!applicationObj) {
                console.log("no application obj");
                return false;
            }
            if (typeof (applicationObj.description) != "string" || applicationObj.description.length == 0) {
                console.log("no descript");
                return false;
            }
            Application.update(id, {$set: {description: serviceObj.description} });
            return id;
        }
    });
}

if (Meteor.isClient) {
    Meteor.subscribe("services");
    Meteor.subscribe("application");
    Template.applyForm.events({
        "submit #applyForm": function (event, template) {
            event.preventDefault();
            event.target.sendApplication.innerHTML = "...";
            // event.target.dataset pulls data from our HTML "data-service-id" attribute
            // which holds the current service the user is applying for
            var service = template.data.service();

            Meteor.call("createApplication", {
                userId: Meteor.userId(),
                gigId: service._id,
                dateCreated: Date.now(),
                description: event.target.description.value
            }, function (err, id) {
                if (id) {
                    Meteor.call("createNotification", {
                        // The creator of the service is the one who needs to be notified
                        userId: service.employer,
                        // The notification object can be used for various things but in this
                        // case we're telling the employer someone applied for this service
                        objectType: "service",
                        objectTypeId: service._id,
                        title: "New Application",
                        // Current logged in user is the applicant
                        description: "New application from " + Meteor.userId() + ".",
                        read: false
                    }, function (err, id) {
                        if (id) {
                            // Update button text
                            event.target.sendApplication.innerHTML = "Thank you for applying";
                        } else {
                            event.target.sendApplication.innerHTML = "There was an error making the notification for application.";
                            // Handle this?
                            console.log(err);
                        }
                    });
                } else {
                    if (err && err.error === "existing-application") {
                        event.target.sendApplication.innerHTML = "You have already applied.";
                    } else {
                        event.target.sendApplication.innerHTML = "There was an error applying.";
                    }

                }
            });
        }
    });
    Template.editApplication.events({
        "submit .editApplication": function(event, template){
            event.preventDefault();
            console.log(this);
            Meteor.call("updateApplication", this.application()._id, {
                description: event.target.description.value,
                
            }, function (err, id) {
                if (id) {
                    FlowRouter.go("/application/" + id);
                } else {
                    console.log(err);
                }
            });

        }
    });
    Template.myApplications.helpers({
        "applications": function () {
            //this finds your own applications
            var applications = Application.find({userId: Meteor.userId()});
            //forcibly mapping relationships
            //this attaches the gig to the application so you can use things like title, employerName, etc.
            var mapped = applications.map(function (application, index) {
                application.gig = Services.findOne({_id: application.gigId});

                return application;
            })
            return mapped;
        }

    });
    Template.applicationPage.helpers({
        "application": function () {
            //this finds your own applications
            var applications = Application.find({userId: Meteor.userId()});
            //forcibly mapping relationships
            //this attaches the gig to the application so you can use things like title, employerName, etc.
            var mapped = applications.map(function (application, index) {
                application.gig = Services.findOne({_id: application.gigId});

                return application;
            })
            return mapped;
        }
    });

    Template.myApplications.events({
        "click #appTrash": function (event) {
            event.preventDefault();
            //delete the application, if it is NEW or DECLINED status only
            if (this.status == "new") {
                Application.remove(this._id);
            }
        },
        "click #viewApplication": function (event) {
            FlowRouter.go("/application/:id");
        },
        "click #editApplication": function (event) {

        }

    });

    Template.gigApplications.events({
        "click #chooseApplicant": function (event) {
            event.preventDefault();

            var applicationId = event.target.dataset.applicationId;
            //change status to processing of the chosen app, the button will go to the contract page
            Application.update(applicationId, {status: "processing"}, function () {
                // hey go to asdf
                window.location = event.target.href;
            });
        },
        "click #declineApplicant": function (event) {
            event.preventDefault();
            console.log(this);
            //change status to processing of the chosen app, the button will go to the contract page
            Application.update(this._id, {$set: {status: "declined"}});
        }

    });
}