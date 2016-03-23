Notification = new Mongo.Collection('notification');

//this was taken from https://github.com/DiscoverMeteor/Microscope/blob/master/lib/collections/notifications.js  -- use to fit our needs
Notification.allow({
   update: function (userId, doc, fieldNames) {
      return ownsDocument(userId, doc) &&
              fieldNames.length === 1 && fieldNames[0] === 'read';
   }
});

if (Meteor.isServer) {

   Meteor.publish("notification", function () {
      return Notification.find({});
   });

   Meteor.methods({
      "createNotification": function (notificationObj) {
         //makes a notification to the employee when you apply for a service listing
         // createServiceApplicationNotification = function(service) {
         var newNotification = Notification.insert({
            //user that the notification is going to
            userId: notificationObj.userId,
            // what kind of notification is going, aka gig, application, friend request, etc
            objectType: notificationObj.objectType,
            //what specific thing you are referencing. aka gig id, user id, etc
            objectTypeId: notificationObj.objectTypeId,
            //notification title
            title: notificationObj.title,
            //description of notification
            description: notificationObj.description,
            //lets you know if the notification was read
            read: false
         });
         return newNotification;
      }
   });

}

if (Meteor.isClient) {

}