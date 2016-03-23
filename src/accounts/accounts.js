
if (Meteor.isServer) {
    Meteor.publish("userData", function () {
        // if (this.userId) {
        //     return Meteor.users.find({_id: this.userId});
        // } else {
        //     this.ready();
        // }
        return Meteor.users.find({});
    });

    Meteor.methods({
        register: function(email, password) {
            Accounts.createUser({
                "email": email,
                "password": password
            });
        }
    })
}

if (Meteor.isClient) {
    Meteor.subscribe("userData");

    Template.register.events({
        "submit .registerForm": function(e) {
            e.preventDefault();

            if (e.target.tos.value == "on" || e.target.tos.value == true) {
                console.log(e.target.email.value);
                console.log(e.target.password.value);

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
}

FlowRouter.route('/register', {
    action: function(params) {
        BlazeLayout.render("layout", {area: "register"});
    }
});
