
Feedback = new Meteor.Collection('Feedback');

FlowRouter.route('/createFeedback', {
    subscriptions: function() {
        this.register('userData', Meteor.subscribe('userData'));
        this.register('feedback', Meteor.subscribe('feedback'));
        this.register('services', Meteor.subscribe('services'));
    },
    action: function(params) {
        FlowRouter.subsReady(function() {
            var user = Meteor.user();
            BlazeLayout.render("layout", {
                area: "createFeedback",
                params: params,
                user: user
            });
        });
    }
});

if (Meteor.isServer) {

    Meteor.publish('feedback', function() {
        return Feedback.find({});
    });

    Meteor.methods({
        // from: <UserID>
        // to: <UserID>
        // rating: 1-5 <Integer>
        // description: What they have to say <String>
        // service: <ServiceId> for what service / gig
        createFeedback: function(from, to, rating, decription, service) {
            // todo: check if from user is the current user.

            Meteor.users.find({_id: from});
            Meteor.users.find({_id: to});

            if (rating > 5 || rating < 1) {
                throw new Meteor.Error("invalid argument");
            }

            if (description.length <= 0 || description.length > 1000) {
                throw new Meteor.Error("descriptin too short/long");
            }

        }
    });

}

if (Meteor.isClient) {

    Template.feedbackList.helpers({

        feedback: function() {
            if (!this.user()) {
                return {};
            } else {
                return Feedback.find({to: this.user()._id});
            }
        }

    });

    Template.feedbackListing.helpers({

        stars: function() {
            console.log(this.user());
            return (new Array(5+1)).join().split('');
        }

    });

    Template.createFeedback.helpers({

        services: function() {
            return Services.find({});
        },

        users: function() {
            return Meteor.users.find({});
        },

        displayName: function(user) {
            if (!user) {
                return "N/A";
            }

            if (user.services && user.services.facebook) {
                if (user.services.facebook.name) {
                    return user.services.facebook.name;
                }
            }
            return censorEmail(user.emails[0].address) || user._id;
        }

    });

    Template.createFeedback.events({

        'submit .createFeedback': function(event) {
            console.log(Template.instance());
            console.log(this.stars);
            // console.log(event.target.)
            // Meteor.call("createFeedback", Meteor.userId(), );
        }

    });

    Template.stars.onCreated(function () {
        console.log(Template.parentData())
        Template.parentData().stars = 0;
    });

}
