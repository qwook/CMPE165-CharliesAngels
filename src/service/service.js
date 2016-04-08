Services = new Mongo.Collection("services");

FlowRouter.route('/gig/:id', {
    action: function (params) {
        var service = Services.findOne({_id: params.id});
      
        //Will either bring in the service or have an empty one so there are no errors when bringing up service.employer
        service = service || {}
        //used for displaying the apply button for employees (see servicelistingpage.html)
        service.isUserEmployer = service.employer === Meteor.userId();

        // get employer user object
        var user = Meteor.users.findOne({_id: service.employer});
 
        var userName;

        if (user.emails && user.emails[0].address) {
            userName = user.emails[0].address;
        } else if (user.profile && user.profile.name) {
            userName = user.profile.name;
        } else {
            userName = "UNKNOWN";
        }

        BlazeLayout.render("layout", {
            area: "serviceListingPage",
            params: params,
            service: service,
            employer: user,
            employerName: userName
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

FlowRouter.route('/postgig', {
    action: function (params) {
        BlazeLayout.render("layout", {area: "servicePostForm"});
    }
});

FlowRouter.route('/edit/:id', {
    action: function (params) {
        var service = Services.findOne({_id: params.id});
        
        //Will either bring in the service or have an empty one so there are no errors when bringing up service.employer
        service = service || {}
        //used for displaying the apply button for employees (see servicelistingpage.html)
        service.isUserEmployer = service.employer === Meteor.userId();

        // get employer user object
        var user = Meteor.users.findOne({_id: service.employer});
       
        BlazeLayout.render("layout", {
            area: "editpost",
            params: params,
            service: service,
            employer: user,
            // This doesnt work atm.
            // employerName: user.emails[0].address
        });
    }
});

FlowRouter.route('/myGigs', {
    action: function (params) {
        BlazeLayout.render("layout", {
            area: "myGigList",
            params: params

        });
    }

});

if (Meteor.isServer) {

    Meteor.publish("services", function () {
        return Services.find({});
    });

    Meteor.methods({
        "createService": function (serviceObj) {

            if (!this.userId) {
                console.log("not logged in");
                return false;
            }

            if (!serviceObj) {
                console.log("no service obj");
                return false;
            }

            if (typeof (serviceObj.title) != "string" || serviceObj.title.length == 0) {
                console.log("no title");
                return false;
            }

            if (typeof (serviceObj.description) != "string" || serviceObj.description.length == 0) {
                console.log("no descript");
                return false;
            }

            if (Number.isNaN(parseInt(serviceObj.wage, 10))) {
                console.log("no wage");
                return false;
            }

            var newService = Services.insert({
                employer: this.userId,
                title: serviceObj.title,
                description: serviceObj.description,
                wage: serviceObj.wage,
				live: true
            });

            return newService;
        }
    });

}

if (Meteor.isClient) {

    Meteor.subscribe("services");

    Template.servicePostForm.events({
        "input #serviceWage": function (event) {
            event.target.value = event.target.value.replace(/\D/g, "");
        },
        "submit .servicePostForm": function (event) {
            event.preventDefault();

            Meteor.call("createService", {
                title: event.target.serviceTitle.value,
                description: event.target.serviceDescription.value,
                wage: parseFloat(event.target.serviceWage.value),
				live: true
            }, function (err, id) {
                if (id) {
                    FlowRouter.go("/gig/" + id);
                } else {
                    console.log("Failure! Handle this!");
                }
            });

        }
    });

    Template.editpost.events({
        "input #serviceWage": function (event) {
            event.target.value = event.target.value.replace(/\D/g, "");
        },
        "submit .editpost": function () {
            event.preventDefault();

            Meteor.call("createService", {
                title: event.target.serviceTitle.value,
                description: event.target.serviceDescription.value,
                wage: parseFloat(event.target.serviceWage.value)
            }, function (err, id) {
                if (id) {
                    FlowRouter.go("/edit/" + id);
                } else {
                    console.log("Failure! Handle this!");
                }
            });

        }
    });

    Template.serviceListingPage.helpers({
        isLoggedIn: function () {
            return Meteor.userId() !== null;
        }
    });

    Template.serviceListingPage.events({
    });

    Template.applyForm.events({
        //will want to call createApplication eventually. For now just button that does notify

        "click #sendApplication": function (event) {
            event.preventDefault();
            // We could be fancy and replace innerHTML with a spinning icon...
            event.target.innerHTML = "...";
            // event.target.dataset pulls data from our HTML "data-service-id" attribute
            // which holds the current service the user is applying for
            var serviceId = event.target.dataset.serviceId;
            var service = Services.findOne(serviceId);
            Meteor.call("createApplication", {
                userId: Meteor.userId(),
                gigId: service._id

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
                            event.target.innerHTML = "Thank you for applying";
                        } else {
                            event.target.innerHTML = "There was an error making the notification for application.";
                            // Handle this?
                            console.log(err);
                        }
                    });
                } else {
                    event.target.innerHTML = "There was an error applying";
                    console.log(err);
                }
            });



        }
    });

}
