// Drop random utility functions here that don't really belong anywhere else.

checkObject = function (scheme, data) {
    for (var key in scheme) {
        if (typeof (data[key]) != scheme[key]) {
            console.log(typeof (data[key]));
            return false;
        }
    }

    return true;
}

censorEmail = function (email) {
    return email.replace(/.@.+/g, "*@****");
}


if (Meteor.isClient) {

    Template.registerHelper("censorEmail", function (email) {
        return censorEmail(email);
    });

    Template.registerHelper('formatDate', function (date) {
        return moment(date).format('MMMM Do YYYY, h:mm a');
    });

}