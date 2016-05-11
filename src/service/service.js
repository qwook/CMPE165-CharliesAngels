
Services = new Mongo.Collection("services");

FlowRouter.route('/gig/:id', {
    subscriptions: function () {
        this.register('services', Meteor.subscribe('services'));
        this.register('feedbackAvg', Meteor.subscribe('feedbackAvg'));
    },
    action: function (params) {
        FlowRouter.subsReady(function () {
            var service = Services.findOne({_id: params.id});

            //Will either bring in the service or have an empty one so there are no errors when bringing up service.employer
            service = service || {}
            //used for displaying the apply button for employees (see servicelistingpage.html)
            service.isUserEmployer = service.employer === Meteor.userId();

            var feedbackAvg = FeedbackAvg.findOne({_id: service.employer});
            console.log(feedbackAvg);

            // get employer user object
            var user = Meteor.users.findOne({_id: service.employer});

            var userName;

            var dateformat = service.date;
            var datePosted = moment(dateformat).format('MMMM DD, YYYY');

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
                feedbackAvg: feedbackAvg,
                employer: user,
                employerName: userName,
                date: datePosted
            });
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
                date: serviceObj.date,
                live: true,
                dateCreated: serviceObj.dateCreated
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
                    category: serviceObj.category,
                    date: serviceObj.date,
                }

            });

            return id;
        },
        "deleteService": function (id, serviceObj)
        {
            Services.remove(id, {
                title: serviceObj.title,
                description: serviceObj.description,
                wage: serviceObj.wage
            });
            //because the service is deleted, it needs to delete any applications associated with the gigid. 
            Application.remove({gigId: id});
        }
    });
    
}

if (Meteor.isClient) {

    Meteor.subscribe("services");

    Template.registerHelper("displayGigName", function(gig) {
        try {
            if (typeof gig == "string") {
                gig = Services.findOne({_id: gig});
            }
        } catch(e) {}

        try {
            return gig.title;
        } catch(e) {
            return "ERROR";
        }
    })

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

            } else {

                Meteor.call("createService", {
                    title: event.target.serviceTitle.value,
                    description: event.target.serviceDescription.value,
                    wage: parseFloat(event.target.serviceWage.value),
                    category: event.target.category.value,
                    date: new Date,
                    dateCreated: Date.now(),
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
                    wage: parseFloat(event.target.serviceWage.value),
                    date: new Date
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
        stars: function() {
            // Hack to do a "for i = 0; i < this.rating; i++" in the html...
            return (new Array(parseInt(this.feedbackAvg().avg)+1)).join().split('');
        },
        isLoggedIn: function () {
            return Meteor.userId() !== null;
        },        
        time: function()
        {
            //Services.findOne().date  is used to fine the date you just create your post
            var dateformat = Services.findOne().date;
            var datePosted = moment(dateformat).format('MMMM DD, YYYY');
            
            return datePosted;
        },
        hasApplied: function () {
            
            //this is not working yet
            //console.log(Application.find({userId: Meteor.userId(), gigId: this.service._id}).count());
            return Application.find({userId: Meteor.userId(), gigId: this.service()._id}).count() > 0
        },
        application: function() {
            return Application.findOne({userId: Meteor.userId(), gigId: this.service()._id});
        }
    });

    Template.serviceListingPage.events({     
        "click #deletePost": function(event) {
            event.preventDefault();

            var result = confirm("Do you really want to delete this post?");
            if (result) {
                Services.remove(this.service()._id);
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
        },

        "hasServices": function() {
            return Services.find({employer: Meteor.userId()}).count() > 0
        }
    });

    Template.myGigsServiceListing.events({
        "click #deletePost": function (event) {
            event.preventDefault();

            Services.remove(this.service._id, function (err, id) {
                FlowRouter.go("/");
            });
        }
    });
    
}
