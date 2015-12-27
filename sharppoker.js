Tasks = new Mongo.Collection("tasks");
Cards = new Mongo.Collection("cards");
Results = new Mongo.Collection("results");
Errors = new Mongo.Collection(null);

if (Meteor.isClient) {
  // This code only runs on the client
  Meteor.subscribe("tasks");
  Meteor.subscribe("cards");
  Meteor.subscribe("results");
  Meteor.subscribe('userData');

  Template.body.helpers({
    cards: function () {
        // If hide completed is checked, filter tasks
        return Cards.find({}, {sort: {createdAt: -1}, limit: 10});
    },
    userData: function () {
        // If hide completed is checked, filter tasks
		  return Meteor.users.find({}, {sort: {"profile.money": -1}, limit: 10});
    },
    results: function(){
      return Results.find({}, {sort: {createdAt: -1}, limit: 10});
    },
    average: function(){
      var sum = 0
      Tasks.find({checked: {$ne: true}}, {sort: {price: 1}, limit: 30}).forEach(function (row) {
        sum += Number(row.price)
      });
      avg = sum / Tasks.find({checked: {$ne: true}}, {sort: {price: 1}, limit: 30}).count();
      return avg
    },
    tasks: function () {
      if (!Session.get("hideCompleted")) {
        // If hide completed is checked, filter tasks
        return Tasks.find({checked: {$ne: true}}, {sort: {price: 1}, limit: 30});
      } else {
        // Otherwise, return all of the tasks
        return Tasks.find({}, {sort: {createdAt: -1}});
      }
    },
    hideCompleted: function () {
      return Session.get("hideCompleted");
    },
    incompleteCount: function () {
      return Tasks.find({checked: {$ne: true}}).count();
    },
    handCount : function(){
      return Cards.find({owner: Meteor.userId()}).count();
    },
    ishandEqual5 : function(){
      return Cards.find({owner: Meteor.userId()}).count() == 5;
    },
    isnothandEqual5 : function(){
      return Meteor.user() && Cards.find({owner: Meteor.userId()}).count() < 5;
    },
    money: function() {
     var user = Meteor.user();
     if (user && user.profile && user.profile.money)
        return user.profile.money;
    },
    topGenresChart: function() {
      var hand = [];
      var cursor = Meteor.users.find({}, {sort: {"profile.money": -1}, limit: 10});
      cursor.forEach(function (row) {
          var money = (row.profile)? row.profile.money : 0;
          hand.push([row.username, money]);
      });
      return {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false
        },
        title: {
            text: "user ranking"
        },
        plotOptions: {
            column: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    },
                    connectorColor: 'silver'
                }
            }
        },
        series: [{
            type: 'column',
            name: 'user',
            data: hand
        }]
    };
}
  });

  Template.body.events({
    "click .publish-cards": function (event){
      Meteor.call("publishCards");
    },
    "click .new-card": function (event) {
      // Prevent default browser form submit
      //event.preventDefault();
      // Get value from form element
      //var text = event.target.text.value;
      // Insert a task into the collection
      Meteor.call("addTask");
      // Clear form
      //event.target.text.value = "";
    },
		"submit .new-task":function (event) {
      // Prevent default browser form submit
      event.preventDefault();
      // Get value from form element
      var text = event.target.text.value;
      // Insert a task into the collection
      Meteor.call("addComment",text);
      // Clear form
      event.target.text.value = "";
		},
    "change .hide-completed input": function (event) {
      Session.set("hideCompleted", event.target.checked);
    }
  });

Template.error.rendered = function() {  var error = this.data;  Meteor.setTimeout(function () {    Errors.remove(error._id);  }, 3000);};

  Template.errors.helpers({
    errors: function() {
		    return Errors.find();
				  }
  });
  Template.card.helpers({
    isOwner: function () {
      return this.owner === Meteor.userId();
    }
  });
  Template.result.helpers({
    isOwner: function () {
      return this.owner === Meteor.userId();
    }
  });
  Template.user.helpers({
		isOwner: function () {
			return this._id == Meteor.userId();
		}
	});
  Template.task.helpers({
    isnotOwner: function () {
      return Meteor.user() && this.owner !== Meteor.userId() && !this.checked;
    }
  });

  Template.card.events({
    "submit .card-sell": function(event){
      // Prevent default browser form submit
      event.preventDefault();

      var text = event.target.price.value;
      Meteor.call("sellCard", this._id, text);
            // Clear form
      event.target.price.value = "";
    }
  });

  Template.task.events({
    "click .toggle-checked": function (event) {
      // Set the checked property to the opposite of its current value
      Meteor.call("setChecked", this._id, ! this.checked);
    },
    "click .delete": function () {
      Meteor.call("deleteTask", this._id)
    },
    "click .toggle-private": function (event) {
      event.preventDefault();
      Meteor.call("setChecked", this._id, ! this.checked);
    }
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
};

Meteor.methods({
  sellCard: function (cardId, price){
    var card = Cards.findOne(cardId);

    if (card.owner !== Meteor.userId() || ! Meteor.userId()){
      // If the task is private, make sure only the owner can delete it
      throw new Meteor.Error("not-authorized");
    }
    //var sum = 0
    //Tasks.find({checked: {$ne: true}}, {sort: {price: 1}, limit: 30}).forEach(function (row) {
    //  sum += Number(row.price)
    //});
    //avg = sum / Tasks.find({checked: {$ne: true}}, {sort: {price: 1}, limit: 30}).count();

		if ( price <= 0 || price >= 1000){
		  return throwError("Price is not reasonable.");
		}
    Tasks.insert({
      suit: card.suit,
      rank: card.rank,
      price: price,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });

    Cards.remove(cardId);
  },
	addComment: function(text){
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    Meteor.users.update( { _id: Meteor.userId() }, { $set: { 'profile.text': text }} );
	},
  addTask: function () {
    // Make sure the user is logged in before inserting a task
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    var random= Meteor.call("randCard");
    if (Cards.find({owner: Meteor.userId()}).count() >= 5) {
      return throwError("You can't have more than 5 cards.");
    }
    if (!Meteor.user().profile || Meteor.user().profile.money <= 0){
      if (Meteor.user().profile && Meteor.user().profile.debt >= 1){
        return throwError("You don't have enough money.");
      }else{
        Meteor.users.update( { _id: Meteor.userId() }, { $inc: { 'profile.money': 1000 }} );
        Meteor.users.update( { _id: Meteor.userId() }, { $inc: { 'profile.debt': 1 }} );
      }
    }

    Meteor.users.update( { _id: Meteor.userId() }, { $inc: { 'profile.money': -100 }} );

    Cards.insert({
      suit: random[2],
      rank: random[1],
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  },

  deleteTask: function (taskId) {
    var task = Tasks.findOne(taskId);

    if (task.private && task.owner !== Meteor.userId() || ! Meteor.userId() ){
      // If the task is private, make sure only the owner can delete it
      throw new Meteor.Error("not-authorized");
    }
    Tasks.remove(taskId);
  },

  setChecked: function (taskId, setChecked) {
    var task = Tasks.findOne(taskId);
            if (task.private && task.owner !== Meteor.userId()) {

      // If the task is private, make sure only the owner can check it off
      throw new Meteor.Error("not-authorized");
    }
    if (Cards.find({owner: Meteor.userId()}).count() >=5 || Meteor.user().profile.money - task.price < 0) {
		  return throwError("You can't buy the card.");
    }

    var price = -1 * task.price;
		var downprice = 1 * task.price;
    Meteor.users.update( { _id: Meteor.userId() }, { $inc: { 'profile.money': price }} );
    Meteor.users.update( { _id: task.owner }, { $inc: { 'profile.money': downprice }} );

    Cards.insert({
      suit: task.suit,
      rank: task.rank,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });

    Tasks.update(taskId, { $set: { checked: setChecked} });
  },

  publishCards: function () {
    var hand = [];
    var cursor = Cards.find({owner: Meteor.userId()})
        cursor.forEach(function (row) {
            hand.push(Meteor.call("convertCard", row.rank, row.suit));
        });

    var result = Meteor.call("judge5", hand);
		var mesg = "You got \\" + result[1];

    Meteor.users.update( { _id: Meteor.userId() }, { $inc: { 'profile.money': result[1] }} );
    Results.insert({
      score: result[1],
      hand: result[2],
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
    Cards.remove({ owner: Meteor.userId() });
  },


  setPrivate: function (taskId, setToPrivate) {
    var task = Tasks.findOne(taskId);
    // Make sure only the task owner can make a task private
    if (task.owner !== Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    Tasks.update(taskId, { $set: { private: setToPrivate } });
  }

});

throwError = function(message) {
	  Errors.insert({message: message});
};

// myTemplate.js
