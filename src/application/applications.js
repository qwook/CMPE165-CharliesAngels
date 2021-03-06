Application = new Mongo.Collection("application");

FlowRouter.route('/myApplications', {
    subscriptions: function () {
        this.register('application', Meteor.subscribe('application'));
    },
    action: function (params) {
        FlowRouter.subsReady(function () {
            var applications = Application.find({userId: Meteor.userId()}).fetch();

            //this gives you access to all the service properties
            var mapped = applications.map(function (application, index) {
                application.gig = Services.findOne(application.gigId);

                return application;
            });

            BlazeLayout.render("layout", {
                area: "myApplications",
                params: params,
                applications: mapped
            });
        });
    }
});
//page for viewing an application
FlowRouter.route('/myApplications/:id', {
    subscriptions: function () {
        this.register('application', Meteor.subscribe('application'));
    },
    action: function (params) {
        FlowRouter.subsReady(function () {

            var application = Application.findOne({_id: params.id});

            var service = Services.findOne({_id: application.gigId});

            var isEmployer = service.employer == Meteor.userId();

            BlazeLayout.render("layout", {
                area: "applicationPage",
                params: params,
                service: service,
                application: application,
                isEmployer: isEmployer
            });
        });
    }
});
//page for editing an application if it is NEW status
FlowRouter.route('/editApplication/:id', {
    subscriptions: function () {
        this.register('application', Meteor.subscribe('application'));
    },
    action: function (params) {
        FlowRouter.subsReady(function () {
            var application = Application.findOne({_id: params.id});
            var service = Services.findOne({_id: application.gigId});
            BlazeLayout.render("layout", {
                area: "editApplication",
                params: params,
                service: service,
                application: application
            });
        });
    }
});
//Page for applying to a gig
FlowRouter.route('/apply/:id', {
    subscriptions: function () {
        this.register('application', Meteor.subscribe('application'));
    },
    action: function (params) {
        FlowRouter.subsReady(function () {
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
        });
    }
});
//page for vewing a specific gig's applications
FlowRouter.route('/gig/:gigId/gigApplications/', {
    subscriptions: function () {
        this.register('application', Meteor.subscribe('application'));
        this.register('feedbackAvg', Meteor.subscribe('feedbackAvg'));
    },
    action: function (params) {
        FlowRouter.subsReady(function () {
            var service = Services.findOne({_id: params.gigId});
            // var applications = Application.find({gigId: params.gigId, status: {$not: "declined"}}).fetch();

            BlazeLayout.render("layout", {
                area: "gigApplications",
                params: params,
                service: service,
                // applications: applications
            });
        });
    }
});
//viewing a specific application from a gig's list of applicants
FlowRouter.route('/gig/:gigId/gigApplications/:id', {
    subscriptions: function () {
        this.register('application', Meteor.subscribe('application'));
    },
    action: function (params) {
        FlowRouter.subsReady(function () {

            var application = Application.findOne({_id: params.id});

            var service = Services.findOne({_id: application.gigId});

            var isEmployer = service.employer == Meteor.userId();

            BlazeLayout.render("layout", {
                area: "applicationPage",
                params: params,
                service: service,
                application: application,
                isEmployer: isEmployer
            });
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
                throw new Meteor.Error("existing-application", "A user is applying twice to the same gig.");

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
        "updateApplication": function (id, applicationObj) {
            if (Meteor.userId() == null) {
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
            Application.update(id, {$set: {description: applicationObj.description}});
            return id;
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
                // Applications.update or insert?? Not sure how to associate with Applications object yet
            }
        });
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
            }, function (err, appId) {
                if (appId) {
                    Meteor.call("createNotification", {
                        // The creator of the service is the one who needs to be notified
                        userId: service.employer,
                        // The notification object can be used for various things but in this
                        // case we're telling the employer someone applied for this service
                        type: "notificationNewApplication",
                        templateData: {
                            application: appId,
                            from: Meteor.userId(),
                            gigId: service._id
                        },
                        read: false
                    }, function (err, id) {
                        if (id) {
                            FlowRouter.go("/myApplications/" + appId);
                            // Update button text
                            // event.target.sendApplication.innerHTML = "Thank you for applying";
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
        "submit .editApplication": function (event, template) {
            event.preventDefault();
            console.log(this);
            Meteor.call("updateApplication", this.application()._id, {
                description: event.target.description.value,
            }, function (err, id) {
                if (id) {
                    FlowRouter.go("/myApplications/" + id);
                } else {
                    console.log(err);
                }
            });

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
            FlowRouter.go("/myApplications/:id");
        },
        "click #editApplication": function (event) {

        }

    });

    Template.gigApplications.helpers({
        "stars": function() {
            var avg = FeedbackAvg.findOne({_id: this.userId});
            var feedbackAvg = 0
            if (avg) {
                feedbackAvg = avg.avg;
            }
            return (new Array(parseInt(feedbackAvg)+1)).join().split('');
        },
        "applications": function() {
            var applications = Application.find({gigId: this.service()._id}).fetch();
            return applications;
        },
        "statusIs": function(cmp) {
            return this.status == cmp;
        }
    });

    Template.applicationPage.helpers({
        "statusIs": function(status) {
            return this.application().status == status;
        },
        "applicationSync": function() {
            return Application.findOne({_id: this.application()._id});
        }
    })

    Template.applicationPage.events({
        "click .accept-gig-application": function(event) {
            event.preventDefault();

            console.log(this);
            console.log(this.service());
            console.log(this._id);

            var _this = this;
            //change status to processing of the chosen app, the button will go to the contract page
            Application.update({_id: this.application()._id}, {$set: {status: "processing"}}, function () {
                FlowRouter.go("/contract/" + _this.application()._id);
            });
        },

        "click .reject-gig-application": function(event) {
            event.preventDefault();

            var _this = this;
            //change status to processing of the chosen app, the button will go to the contract page
            Application.update({_id: this.application()._id}, {$set: {status: "declined"}}, function () {
                FlowRouter.go("/gig/" + _this.service()._id + "/gigApplications/");
            });
        }
    })

    Template.gigApplications.events({
        "click #chooseApplicant": function (event) {
            event.preventDefault();

            var _this = this;
            //change status to processing of the chosen app, the button will go to the contract page
            Application.update({_id: this._id}, {$set: {status: "processing"}}, function () {
                // hey go to asdf. CHANGE THIS
                // window.location = event.target.href;
                FlowRouter.go("/contract/" + _this._id);
                // Services.update({_id: _this.gigId}, {$set: {live: false}});
            });
        },
        "click #declineApplicant": function (event) {
            event.preventDefault();
            console.log(this);
            //change status to processing of the chosen app, the button will go to the contract page
            Application.update({_id: this._id}, {$set: {status: "declined"}});
        }

    });
}