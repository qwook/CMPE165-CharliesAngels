FlowRouter.route('/stripe-checkout', {
    action: function (params) {
        BlazeLayout.render("layout", {
            area: "stripe-checkout",
            params: params
        });
    }
  });
if (Meteor.isClient) {
  Template.hello.events({
    'click button': function(e) {
      e.preventDefault();

      StripeCheckout.open({
        key: 'pk_test_7qMdCgDu9VIowi3umnwOlCge',
        amount: 5000, // this is equivalent to $50
        name: 'Meteor Tutorial',
        description: 'On how to use Stripe ($50.00)',
        panelLabel: 'Pay Now',
        token: function(res) {
          stripeToken = res.id;
          console.info(res);
          Meteor.call('chargeCard', stripeToken);
        }
      });
    }
  });
}

if (Meteor.isServer) {
  Meteor.methods({
    'chargeCard': function(stripeToken) {
      check(stripeToken, String);
      var Stripe = StripeAPI('sk_test_eyF4U8469Zra4hhKjsaon8Kd');

      Stripe.charges.create({
        source: stripeToken,
        amount: 5000, // this is equivalent to $50
        currency: 'usd'
      }, function(err, charge) {
        console.log(err, charge);
      });
    }
  });
}
