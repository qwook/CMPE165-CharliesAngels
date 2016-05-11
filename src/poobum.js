
FlowRouter.route('/poobum', {
    action: function (params) {
        BlazeLayout.render("layout", {
            area: "poobum",
        });
    }
});