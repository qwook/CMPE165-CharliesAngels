
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

            var dateformat = service.date;
            var datePosted = moment(dateformat).format('MMMM DD, YYYY h:mm');
            var currentDate= new Date;
            var currentDateFormat = moment(currentDate).format('DD');
            var datePostedFormat = moment(dateformat).format('DD');
            var countDate = currentDateFormat - datePostedFormat;

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
                employerName: userName,
                date: datePosted,
                countDate: countDate
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
                date: serviceObj.date,
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
                    category: serviceObj.category,
                    date: serviceObj.date,
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
                    date: new Date,
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
        isLoggedIn: function () {
            return Meteor.userId() !== null;
        },
        
    
        time : function()
        {
            //Services.findOne().date  is used to fine the date you just create your post
            var dateformat = Services.findOne().date;
            var datePosted = moment(dateformat).format('MMMM DD, YYYY h:mm');
            
            return datePosted;
        }
        
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
    Template.serviceListingPage.events({     
        
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

            Template.index.helpers({
          
            filteredPosts: function () {
            var ListId = Session.get('selectedListId');
            var filter = Session.get('filter');


            //if list is not empty, find category
                if (ListId != null && filter != null) 
                {
                   return Services.find(filter, {sort: {createdAt: -1}}, {category: ListId});

                } 
                else if  (ListId == null && filter == null) 
                {
                    return Services.find({},{sort: {createdAt: -1}}, {category: ListId});
                }

                else if  (ListId == null && filter != null) 
                {
                      return Services.find(filter, {sort: {createdAt: -1}});

                } else 
                {
                    return Services.find({}, {category: ListId});
                }
                
              
            },
 
            filteredDate: function () {
                var filter = Session.get('filter');
                  
      
                if (filter != null) {
                    return Services.find(filter, {sort: {createdAt: -1}});

                } else {
                    return Services.find({}, {sort: {createdAt: -1}});
                };
      
            }
        });
            Template.index.events({

            "submit .filter": function () {
            event.preventDefault();
            console.log("clicked");

            var ListId = event.target.category.value;
            Session.set('selectedListId', ListId);

            var filter = event.target.getAttribute('data-filter');
                var filterNum = parseInt(filter);
                var min= 0;
                var max= 0;

                if(filterNum === 25){
                    min = 0;
                    max = 25;
                }
                else if(filterNum === 50){
                    min = 25;
                    max = 50;
                }
                else if(filterNum === 100){
                    min = 50;
                    max = 100;
                }
                else if(filterNum === 200){
                    min = 100;
                    max = 200;
                }

                else if(filterNum === 10000){
                    min = 200;
                    max = 10000;
                }
                else {
                    max = 1000*1000; // give a big number if wage is more than 10000, check this later
                }
                    
                Session.set('filter', { wage: {$gte: min, $lte: max} } );

             },

            /*
            'change select': function (e) {
                var ListId = $(e.currentTarget).val();
                Session.set('selectedListId', ListId);
            },
            */
            /*

            'click .wageFilter': function(event) {
                var filter = event.target.getAttribute('data-filter');
                var filterNum = parseInt(filter);
                var min= 0;
                var max= 0;

                if(filterNum === 25){
                    min = 0;
                    max = 25;
                }
                else if(filterNum === 50){
                    min = 25;
                    max = 50;
                }
                else if(filterNum === 100){
                    min = 50;
                    max = 100;
                }
                else if(filterNum === 200){
                    min = 100;
                    max = 200;
                }

                else if(filterNum === 10000){
                    min = 200;
                    max = 10000;
                }
                else {
                    max = 1000*1000; // give a big number if wage is more than 10000, check this later
                }
                     

                Session.set('filter', { wage: {$gte: min, $lte: max} } );
            },
            */

            'click .dateFilter': function(event) {
                var filter = event.target.getAttribute('data-filter');
                var filterNum = parseInt(filter);
                var start = 0;
                var end = 0;

            var filterNumFormat = moment(currentDate).format('MMMM DD, YYYY h:mm');

            var currentDate= new Date;
            var currentDateFormat = moment(currentDate).format('MMMM DD, YYYY h:mm');

            var countDate = currentDateFormat - datePostedFormat;



                if(filterNum === 1){
                    start = 0;
                    end = 1;
                }
                else if(filterNum === 3){
                    start = 1;
                    end = 3;
                }
                else if(filterNum === 7){
                    start = 3;
                    end = 7;
                }
                else if(filterNum === 30){
                    start = 7;
                    end = 30;
                }

                else if(filterNum === 10000){
                    start = 31;
                    end = 10000;
                }
                else {
                    end = 1000*1000; // give a big number if wage is more than 10000, check this later
                }
                     

                Session.set('filter', { date: {$gte: start, $lte: end} } );
            }
          });
        

}
