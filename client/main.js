import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

text = new ReactiveVar("Sex");
loginname = new ReactiveVar("guest");
score = new ReactiveVar(0);


Template.info.onCreated(function helloOnCreated() {

});

Template.info.helpers({
  msg() {
	return text.get();
  },
});

Template.parent.helpers({
	getLoginName() {
		return loginname.get();
	},
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
		Meteor.call("consolelog", loginname.get() + " loggin out.");
		loginname.set("guest");
		score.set(0);
		text.set("");
	},
	'click button#leaderboard'(event, instance) {
	}
});

Template.hello.events({
  	'click button'(event, instance) {
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
			}
		});
		Meteor.call("getMsg", function(err, data) {
			text.set(data);
		});
  	},
});
