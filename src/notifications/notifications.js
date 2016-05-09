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
            // makes a notification to the employee when you apply for a service listing
            // createServiceApplicationNotification = function(service) {
            var newNotification = Notification.insert({
                // user that the notification is going to
                userId: notificationObj.userId,
                // type of notification to switch between templates
                type: notificationObj.type,
                // Data necessary for the Template (see notifications.html)
                templateData: notificationObj.templateData,
                // has the user clicked on the notification
                read: false
            });
            return newNotification;
        }
    });

}

if (Meteor.isClient) {

    Template.notifications.helpers({
        "notifications": function () {
            // Return all notifications for the current user
            
            return Notification.find({userId: Meteor.userId()});
        },
        "hasNotifications": function() {
            return Notification.find({userId: Meteor.userId()}).count()>0;
        }
    });

}