var Userdata = new Meteor.Collection("userData");

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
            // console.log("you are checking: " + e.target.checked.value);


             if (e.target.checkbox.checked == true ) {
                Meteor.call("register", e.target.email.value, e.target.password.value, function() {
                    Meteor.loginWithPassword(e.target.email.value, e.target.password.value);
                    FlowRouter.go("/");
                });
            }
            else 
            {
                var term = confirm("You can not register without agreeing with our terms of service!");
                FlowRouter.go("/register");
            }
        }
    });

   // get input values from editprofile template and display it to profile page
     Template.editprofileTemp.events({

        "submit .editprofileTemp": function(event) {
             event.preventDefault();
            
            var gender = event.target.gender.value 
            console.log("gender" + gender);
            
             //editId is userID
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
            
            Meteor.loginWithPassword(e.target.email.value, e.target.password.value, function(err){
                if(err) {
                    var invalid = confirm("Invalid email and/or password!");
                }
            });
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

