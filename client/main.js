import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import * as RLocalStorage from 'meteor/simply:reactive-local-storage';

//import './main.html';

page = RLocalStorage;
function getLoginName() { return page.getItem('loginname'); }
function getScore() { return page.getItem('score'); }
function setLoginName(name) { page.setItem('loginname', name); }
function setScore(score) { page.setItem('score', score); }
function isLoggedIn() { return !(getLoginName() === 'guest'); }
text = new ReactiveVar('Default Message, change in future');

Template.parent.created = function() {
	if(getScore() === null || getLoginName() === null){
		setScore(0);
		setLoginName('guest');
		console.log('No record of previous login found, loggin in as guest');
	}
	console.log(getLoginName() + ' logged in with a score of ' + getScore());
};

Template.parent.helpers({
	getTemplate: function() {
		var l = window.location.href;
		if(l.endsWith('home')) return Template.home;
		else if(l.endsWith('register')) if(isLoggedIn()) return Template.dashboard; else return Template.register;
		else if(l.endsWith('signin')) if(isLoggedIn()) return Template.dashboard; else return Template.signin;
		else if(l.endsWith('leaderboard')) return Template.leaderboard;
		else return Template.notfound;
	}
});

Template.dashboard.helpers({
	username: function(){ return getLoginName() },
	score: function(){ return getScore(); }
});

Template.leaderboard.helpers({
	get: function() { //Template.instance().leaders.get(); }
		return 'SITH SITH'; }
});

Template.hotbar.helpers({
	getM: function(){ return text.get(); },
	getLoginData: function(){ return getLoginName() + ' with score ' + getScore(); }
});

Template.dashboard.events({
	'click button#logout'(event, instance) {
		console.log('Logout Btn pressed');
		setLoginName('guest');
		setScore(0);
		text.set("Logged out successfully");
	},
	'click button#leaderboard'(event, instance) {
	}
});

Template.register.events({
  	'click button#btn_register'(event, instance) {
		console.log('Register Btn pressed');
		Meteor.call("register", $("#name").val(), $("#pwd").val());
  	},
});
Template.signin.events({
  	'click button'(event, instance) {
		console.log('Sign In Btn pressed');
		Meteor.call("signin", $("#login_name").val(), $("#login_pwd").val(), function(err, data) {
			if(err){ console.log('This is error' + err); return;}
			text.set(data[0]);
			setLoginName(data[1]);
			setScore(data[2]);
		});
	},
});

