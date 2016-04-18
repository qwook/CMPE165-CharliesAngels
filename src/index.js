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
            Meteor.logout();
        },

        "click .sign-in-fb": function(e) {
            Meteor.loginWithFacebook();
            e.preventDefault();
        }
    });

    Template.contractPage.helpers({
        "services": function () {
            return Services.find({});
        }
    });

    Template.index.helpers({
        "services": function () {
            var services = Services.find({});

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

    Template.layout.helpers({
        "notifications": function () {
            // Return all notifications for the current user
            
            return Notification.find({userId: Meteor.userId()});
        },
    });
}
