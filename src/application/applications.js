Application = new Mongo.Collection("application");

FlowRouter.route('/myApplications',{
    action: function(params){
        BlazeLayout.render("layout",{
            area:"myApplicationList",
            params: params
            
        });
    }
});

if (Meteor.isServer) {


   Meteor.methods({
      "createApplication": function (applicationObj) {
         
         var newApplication = Application.insert({
            //user that is applying for position
            userId: applicationObj.userId,
            //gig id that the application is for
            gigId: applicationObj.gigId,
            //employer id...maybe
            //file upload
            
            //new, accepted, or declined
            status: "new"
         });
         return newApplication;
      }
   });

}

if (Meteor.isClient) {

}