
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
        createFeedback: function(from, to, rating, description, service) {
            // todo: check if from user is the current user.

            var fromObj = Meteor.users.find({_id: from});
            var toObj = Meteor.users.find({_id: to});

            var serviceObj = Services.find({_id: service});

            if (!from) {
                throw new Meteor.Error("invalid <from> argument");
            }

            if (!to) {
                throw new Meteor.Error("invalid <to> argument");
            }

            if (!service) {
                throw new Meteor.Error("invalid <service> argument");
            }

            if (rating > 5 || rating < 1) {
                throw new Meteor.Error("invalid <rating> arguments");
            }

            if (description.length <= 0 || description.length > 1000) {
                throw new Meteor.Error("description too short/long");
            }

            return Feedback.insert({
                from: from,
                to: to,
                rating: rating,
                description: description,
                service: service
            });
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

        fromUser: function() {
            var user = Meteor.users.findOne({_id: this.from});

            if (!user) {
                return "N/A";
            }

            if (user.services && user.services.facebook) {
                if (user.services.facebook.name) {
                    return user.services.facebook.name;
                }
            }
            return censorEmail(user.emails[0].address) || user._id;
        },

        stars: function() {
            // Hack to do a "for i = 0; i < this.rating; i++" in the html...
            return (new Array(parseFloat(this.rating)+1)).join().split('');
        }

    });

    Template.createFeedback.helpers({

        services: function() {
            return Services.find({});
        },

        users: function() {
            return Meteor.users.find({});
        }
    });

    Template.createFeedback.events({

        'submit .createFeedback': function(event) {
            // console.log(Template.instance());
            console.log(event.target.description.value);
            console.log(event.target.stars.value);
            // console.log(event.target.)
            Meteor.call("createFeedback",
                Meteor.userId(),
                event.target.to.value,
                event.target.stars.value,
                event.target.description.value,
                event.target.service.value
            );
            event.preventDefault();
        }

    });

    Template.stars.events({
        'click .star': function(event) {
            var _this = Template.instance();
            _this.$('.hiddenStar').val(event.target.attributes.value.value);

            _this.starsDep.changed();
        },

        'mouseenter .star': function(event) {
            var _this = Template.instance();

            _this.stars = event.target.attributes.value.value;
            _this.starsDep.changed();
        },

        'mouseleave .star': function(event) {
            var _this = Template.instance();

            _this.stars = 0;
            _this.starsDep.changed();
            // console.log(event.target);
            // console.log(event.target.attributes.value.value);
        }
    });

    Template.stars.helpers({
        'style': function(val) {
            var _this = Template.instance();

            _this.starsDep.depend();

            if (_this.view.isRendered) {
                if (_this.stars >= val || _this.stars == 0 && _this.$('.hiddenStar').val() >= val) {
                    return "color: red;"
                }
            }

            return "";
        }
    });

    Template.stars.onCreated(function () {
        this.stars = 0;
        this.starsDep = new Tracker.Dependency;

        // console.log(Template.parentData())
        // Template.parentData().stars = 0;
    });

}
