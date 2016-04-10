
var Soundcloud = new Meteor.Collection("Soundcloud");

if (Meteor.isServer) {
	Meteor.publish("soundcloud", function() {
		return Soundcloud.find({});
	})

    Meteor.methods({
        "addSoundcloudSong": function(url) {
        	if (!Meteor.user()) {
        		return;
        	}

        	var html = HTTP.post("http://soundcloud.com/oembed", {
        		data: {
        			format: "json",
        			url: url,
        			maxheight: 150
        		}
        	}).data.html;

        	Soundcloud.insert({owner: Meteor.userId(), html: html});
        }
    })
}

if (Meteor.isClient) {
	Template.soundCloudSongList.helpers({
		"soundCloudSongs": function() {
			console.log(this);
			return Soundcloud.find({owner: this.user()._id});
		},

        "isCurrentUser": function() {
			console.log(this);
            if (this.user()._id == Meteor.userId()) {
                return true;
            }
        }
	});

	Template.soundCloudSongList.events({
		"click .remove": function(event) {
			console.log(this._id);

			Soundcloud.remove({_id: this._id});

			event.preventDefault();
		}
	});

	Template.profile.events({
        "click .soundcloud-button": function(event) {
            Template.instance().$("#sound-cloud-modal").modal("show")
            event.preventDefault();
        }
	});

    Template.soundcloudModal.events({
        "submit #sound-cloud-modal": function(event) {
        	var tmpl = Template.instance();

        	Meteor.call("addSoundcloudSong", tmpl.$(".soundcloud-url").val(), function() {
	            tmpl.$("#sound-cloud-modal").modal("hide")
        	});

        	event.preventDefault();
        }
    });
}
