  // Only publish tasks that are public or belong to the current user
  Meteor.publish("tasks", function () {
    return Tasks.find({
      $or: [
        { private: {$ne: true} },
        { owner: this.userId }
      ]
    });
  });

  Meteor.publish("cards", function () {
    return Cards.find({ owner: this.userId });
  });
  Meteor.publish("results", function () {
    return Results.find();
  });
	Meteor.publish("userData", function (){
    return Meteor.users.find({},{fields: {'username':1, 'profile.money':1, 'profile.text':1}});//Users.find({}, {sort: {createdAt: -1}});
	});

Meteor.methods({
  topGenresCharts: function() {
    var hand = [];
    var cursor = Meteor.users.find({}, {sort: {"profile.money": -1}, limit: 10});
    cursor.forEach(function (row) {
        hand.push([row.username, row.profile.money]);
    });
    console.log(hand)
    return hand
  },
	randCard: function(){
    var ary = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
    var random = ary[Math.floor(Math.random() * ary.length)];

    var ary2 = ['spades','clubs','hearts','diams'];
    var random2 = ary2[Math.floor(Math.random() * ary2.length)];
		return [true, random, random2];
	},
  judge5: function(hand){
			result = " HIGH GARBAGE";
			price = 300;
    return [true, price*0.8 , result];
  }
});
