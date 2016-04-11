
if (Meteor.isServer) {
    Meteor.publish("userData", function () {
        return Meteor.users.find({});
    });

    Meteor.methods({
        register: function(email, password) {
            Accounts.createUser({
                "email": email,
                "password": password
            });
        }
    });
}

if (Meteor.isClient) {
    Meteor.subscribe("userData");

    Template.register.events({
        "submit .registerForm": function(e) {
            e.preventDefault();

            if (e.target.tos.value == "on" || e.target.tos.value == true) {
            

                Meteor.call("register", e.target.email.value, e.target.password.value, function() {
                    FlowRouter.go("/");
                });
            }

        }
    });

    Template.loginBox.events({
        "submit .loginBox": function(e) {
            e.preventDefault();

            Meteor.loginWithPassword(e.target.email.value, e.target.password.value);
        }
    })

    Template.profile.helpers({
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
        },
        info: function()
        {
            return 
        },

        description: function() {
            if (this.user().profile) {
                return this.user().profile.description || ""
            }
        },

        isCurrentUser: function() {
            if (this.user()._id == Meteor.userId()) {
                return true;
            }
        }
    })
}

FlowRouter.route('/register', {
    action: function(params) {
        BlazeLayout.render("layout", {area: "register"});
    }
});

FlowRouter.route('/profile/:id', {
    subscriptions: function() {
        this.register('userData', Meteor.subscribe('userData'));
        this.register('Editprofile', Meteor.subscribe('Editprofile'));
        this.register('soundcloud', Meteor.subscribe('soundcloud'));
    },
    action: function(params) {
        FlowRouter.subsReady(function() {
            var user = Meteor.users.findOne({_id: params.id});
            BlazeLayout.render("layout", {
                area: "profile",
                params: params,
                user: user
            });
        });
    }
});

