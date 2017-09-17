import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

//import './main.html';

text = new ReactiveVar("Sex");
loginname = new ReactiveVar("guest");
score = new ReactiveVar(0);
url = new ReactiveVar("/");

Template.leaderboard.created = function() {
	var self = this;
	self.leaders = new ReactiveVar("Fetching positions...");
	Meteor.call('getLeaderBoardList', function(err, data){
		self.leader.set(data);
	});
	Meteor.call('consolelog', self.leaders.get());
};

Template.parent.helpers({
	'getLogiName': function(){
		return loginname.get();
	}
});

Template.leaderboard.helpers({
	'get': function() {
		Template.instance().leaders.get();
	},
});
Template.info.helpers({
  infolabel: function() {
	return text.get();
  }
});

Template.dashboard.helpers({
	getLoginName() {
		return loginname.get();
	},
	getscore() {
		return score.get();
	},
});

Template.dashboard.events({
	'click button#logout'(event, instance) {
		Meteor.call("consolelog", "CLIENT: " + loginname.get() + " loggin out.");
		loginname.set("guest");
		score.set(0);
		text.set("");
	},
	'click button#leaderboard'(event, instance) {
	}
});

Template.register.events({
  	'click button#btn_register'(event, instance) {
		Meteor.call("register", $("#name").val(), $("#pwd").val());
		Meteor.call("getMsg", function(err, data) {
			text.set(data);
		});
  	},
});
Template.signin.events({
  	'click button'(event, instance) {
		Meteor.call("signin", $("#login_name").val(), $("#login_pwd").val(), function(err, data) {
			if(err){
				loginname.set("guest");
				score.set(0);
			} else {
				text.set(data[0]);
				loginname.set(data[1]);
				score.set(data[2]);
				Meteor.call('consolelog', "CLIENT: Login name changed to " + loginname.get());
			}
		});
		Meteor.call("getMsg", function(err, data) {
			text.set(data);
		});
  	},
});

