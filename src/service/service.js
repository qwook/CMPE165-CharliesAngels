// import { Services } from '../service/service.js';
Services = new Mongo.Collection("services");

FlowRouter.route('/gig/:id', {
    subscriptions: function () {
        this.register('services', Meteor.subscribe('services'));
    },
    action: function (params) {
        FlowRouter.subsReady(function () {
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
    subscriptions: function () {
        this.register('services', Meteor.subscribe('services'));
    },
    action: function (params) {
        FlowRouter.subsReady(function () {

            var service = Services.findOne({_id: params.id});

            //Will either bring in the service or have an empty one so there are no errors when bringing up service.employer
            service = service || {}
            //used for displaying the apply button for employees (see servicelistingpage.html)
            service.isUserEmployer = service.employer === Meteor.userId();

            // get employer user object
            var user = Meteor.users.findOne({_id: service.employer});

            BlazeLayout.render("layout", {
                area: "EditPost",
                params: params,
                service: service,
                employer: user,
                // This doesnt work atm.
                // employerName: user.emails[0].address
            });
        });
    }
});

FlowRouter.route('/myGigs', {
    action: function (params) {
        BlazeLayout.render("layout", {
            area: "myGigs",
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
                category: serviceObj.category,
                live: true
            });

            return newService;
        },
        "updateService": function (id, serviceObj) {

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


            Services.update(id, {$set: {
                    title: serviceObj.title,
                    description: serviceObj.description,
                    wage: serviceObj.wage,
                    category: serviceObj.category
                }

            });

            return id;

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
            console.log("category: " +event.target.category.value);
            
            //check whether selected category
            //remind user when the category is not selected
            if (event.target.category.value === "") {
                var checkCategory = confirm("Please select a category!"); 

            }
            else {

                     Meteor.call("createService", {
                    title: event.target.serviceTitle.value,
                    description: event.target.serviceDescription.value,
                    wage: parseFloat(event.target.serviceWage.value),
                    category: event.target.category.value,
                    live: true
                }, function (err, id) {
                    if (id) {
                        FlowRouter.go("/gig/" + id);
                    } else {
                        console.log(err);
                    }
                });

            }

           
        }
    });

    Template.EditPost.events({
        "input #serviceWage": function (event) {
            event.target.value = event.target.value.replace(/\D/g, "");
        },
        "submit .editpost": function () {
            event.preventDefault();

                //check whether selected category
             if (event.target.category.value === "") {
                var checkCategory = confirm("Please select a category!"); 

            }
            else
            {
                     Meteor.call("updateService", this.service()._id, {
                    title: event.target.serviceTitle.value,
                    description: event.target.serviceDescription.value,
                    category: event.target.category.value,
                    wage: parseFloat(event.target.serviceWage.value)
                }, function (err, id) {
                    if (id) {
                        FlowRouter.go("/gig/" + id);
                    } else {
                        console.log(err);
                    }
                });
            }
           

        }
    });

    Template.serviceListingPage.helpers({
        isLoggedIn: function () {
            return Meteor.userId() !== null;
        }
        /*
        //need to add momentjs:moment to meteor
        time : function()
        {
            return moment(this.timestamp).format('mm/yyyy a');
        }
        */
    });

    Template.layout.helpers({
          services: function() {
            return Services.find({});
        }
    })

    Template.serviceListing.events({     
        
        "click #deletePost": function(event) {
             event.preventDefault();

            var result = confirm("Do you really want to delete this post?");
            if (result) {
                Services.remove(this.service._id);
                FlowRouter.go("/");          

            }
            
        }
    });
    
    Template.myGigs.helpers({
        "services": function () {
            var services = Services.find({employer: Meteor.userId()});

            var mapped = services.map(function (service, index, array) {
                //gives access to index for isUserEmployer flag for the edit and such buttons
                service.isUserEmployer = service.employer === Meteor.userId();
                return service;
            });
            return mapped;
        }
    });

    Template.myGigsServiceListing.helpers({
        "applications": function () {
            //NEEDS FIXING. NEED TO FIND A SPECIFIC GIG ID THAT IS LINKED TO THE BUTTON PRESSED
            var applications = Application.find({gigId: this.service._id});
            return applications;
        }
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
                    if (err && err.error === "existing-application") {
                        event.target.innerHTML = "You have already applied.";
                    } else {
                        event.target.innerHTML = "There was an error applying.";
                        console.log(err);
                    }

                }
            });
        }
    
    });

}
