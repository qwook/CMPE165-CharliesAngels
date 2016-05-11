
FlowRouter.route('/', {
    action: function (params) {
        BlazeLayout.render("layout", {area: "index"});
    }
});

if (Meteor.isClient) {

    Meteor.startup(function() {
        GoogleMaps.load();

      
    });

    Template.layout.events({
        "click .post-a-gig": function (event) {
        },
        "click .profile": function (event) {
        },
        "click .logout": function (event) {
            event.preventDefault();
            Meteor.logout(function(){
                FlowRouter.go("/");
                
            });
        },

        "click .sign-in-fb": function(e) {
            Meteor.loginWithFacebook();
            e.preventDefault();
        }
    });

    Template.registerHelper("not", function(a) {
        return !a;
    });

    Template.contractPage.helpers({
        "services": function () {
            return Services.find({});
        }
    });

    Template.index.helpers({
        "services": function () {
            var services = Services.find({live: true});

            var mapped = services.map(function (service, index, array) {
                //gives access to index for isUserEmployer flag for the edit and such buttons
                service.isUserEmployer = service.employer === Meteor.userId();
                return service;
            });
            return mapped;
        },
        "mapOptions": function() {
            // Make sure the maps API has loaded
            if (GoogleMaps.loaded()) {
                // Map initialization options
                return {
                    streetViewControl: false, // hide the yellow Street View pegman
                    scaleControl: false, // allow users to zoom the Google Map
                    center: new google.maps.LatLng(37.3382, -121.8863),
                    disableDefaultUI: true,
                    draggable: false,
                    scrollwheel: false,
                    panControl: false,
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    zoom: 16,
                    styles: [
                        {
                            "stylers": [
                            { "hue": "#002bff" },
                            { "invert_lightness": true },
                            { "saturation": -63 },
                            { "lightness": 30 },
                            { "gamma": 0.54 }
                            ]
                        }
                    ]
                };
            }
        }
    });


    Template.index.helpers({
        filteredPosts: function () {
            var ListId = Session.get('selectedListId');
            var filter = Session.get('filter');

            console.log(ListId);
            console.log(filter);

            //if list is not empty, find category
            if (ListId != null && filter != null) {
                filter.category = ListId;
                return Services.find(filter, {sort: {createdAt: -1}});
            } else if  ((ListId == null || ListId.length == 0) && filter == null) {
                return Services.find({},{sort: {createdAt: -1}});
            } else if  ((ListId == null || ListId.length == 0) && filter != null) {
                console.log(ListId.length);
                console.log(ListId);
                return Services.find(filter, {sort: {createdAt: -1}});
            } else {
                return Services.find({category: ListId});
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
            } else if(filterNum === 50){
                min = 25;
                max = 50;
            } else if(filterNum === 100){
                min = 50;
                max = 100;
            } else if(filterNum === 200){
                min = 100;
                max = 200;
            } else if(filterNum === 10000){
                min = 200;
                max = 10000;
            } else {
                max = 1000*1000; // give a big number if wage is more than 10000, check this later
            }

            Session.set('filter', { wage: {$gte: min, $lte: max} } );

        },

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

    Template.index.currentViewIs = function (view) {
        if( Session.get('currentView') == view)
            return true;
        return false;
    };

}