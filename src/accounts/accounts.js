
var Userdata = new Meteor.Collection("userData");

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
        },
        
        "editProfile": function(id, profileObj) {
        
           
            if (!this.userId) {
                console.log("not logged in");
                return false;
            }

            if (!profileObj) {
                console.log("no profile obj");
                return false;
            }

            if (typeof (profileObj.firstname) != "string" || profileObj.firstname.length == 0) {
                console.log("no firstname");
                return false;
            }

            if (typeof (profileObj.lastname) != "string" || profileObj.lastname.length == 0) {
                console.log("no lastname");
                return false;
            }
             if (typeof (profileObj.experience) != "string" || profileObj.experience.length == 0) {
                console.log("no experience");
                return false;
            }
             if (typeof (profileObj.education) != "string" || profileObj.education.length == 0) {
                console.log("no education");
                return false;
            }
             if (typeof (profileObj.skills) != "string" || profileObj.skills.length == 0) {
                console.log("no skills");
                return false;
            }
             if (typeof (profileObj.gender) != "string" ) {
                console.log("no gender");
                return false;
            }

            if (Number.isNaN(parseInt(profileObj.phonenumber, 11))) {
                console.log("no phonenumber");
                return false;
            }

              Meteor.users.update(id, {$set: {
                employer: id,
                firstname: profileObj.firstname,
                lastname: profileObj.lastname,
                experience: profileObj.experience,
                education: profileObj.education,
                skills: profileObj.skills,
                gender: profileObj.gender,
                phonenumber: profileObj.phonenumber,
                }
            });
             console.log("returned "+id);

            return id;
        }


    });
}

if (Meteor.isClient) {
    Meteor.subscribe("userData");
    Template.register.events({
   
        "submit .registerForm": function(e) {
            e.preventDefault();
            console.log("you are checking: " + e.target.checked.value);


             if (e.target.checkbox.value == true ) {
            
                     console.log("you checked: " + e.target.checkbox.value);
                Meteor.call("register", e.target.email.value, e.target.password.value, function() {
                    FlowRouter.go("/");
                });
            }
            else 
            {
                 console.log("you can't  " + e.target.checked.value);
                var term = confirm("You can not register without agree with our terms of service!");
                FlowRouter.go("/register");
            }
        }
    });

    Template.editprofileTemp.events({

        "submit .editprofileTemp": function(event) {
            event.preventDefault();
            
           var gender = event.target.gender.value 
            console.log("gender" + gender);

             Meteor.call("editProfile",this.editId(), {

                firstname: firstname.value,
                lastname: lastname.value,
                experience: experience.value,
                education: education.value,
                skills: skills.value,
                gender: gender,
                phonenumber: phonenumber.value,
       
            }, function (err, id) {
                if (id) {
                    console.log("link edit : " + id)
                    FlowRouter.go("/profile/" + id);
                } else {  
                     console.log("you are getting error " );
                    console.log(err);
                }
            });
        }
    });


    Template.loginBox.events({
        "submit .loginBox": function(e) {
            e.preventDefault();

            Meteor.loginWithPassword(e.target.email.value, e.target.password.value);
        }
    });


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
            //this 0 is undefined
            return user.emails[0].address;
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
    });

}

FlowRouter.route('/register', {
    action: function(params) {
        BlazeLayout.render("layout", {area: "register"});
    }
});

FlowRouter.route('/profile/:id', {
    subscriptions: function() {
        this.register('userData', Meteor.subscribe('userData'));
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
FlowRouter.route('/editprofile/:id', {
    subscriptions: function() {
        this.register('userData', Meteor.subscribe('userData'));
    },

        action: function (params) {
             FlowRouter.subsReady(function() {
                var user = Userdata.findOne({_id: params.id});
                 user = user || {}
               var editId = Meteor.userId();
      
                BlazeLayout.render("layout", {
                    area: "editprofileTemp",
                    params: params,
                    editId: editId,
                    user: user   
                });
            });
        }
});
