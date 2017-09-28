import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import * as RLocalStorage from 'meteor/simply:reactive-local-storage';

//import './main.html';

page = RLocalStorage;
function getLoginName() { return page.getItem('loginname'); }
function getScore() { return page.getItem('score'); }
function getPassword() { return page.getItem('password'); }
function setPassword(pass) { page.setItem('password', pass); }
function setLoginName(name) { page.setItem('loginname', name); }
function setScore(score) { page.setItem('score', score); }
function isLoggedIn() { return !(getLoginName() === DEFAULT_LOGIN_NAME); }
text = new ReactiveVar('Default Message, change in future');
Meteor.subscribe(PUB_LEADERS);

Template.parent.created = function() {
	if(getScore() === null || getLoginName() === null){
		setScore(0);
		setLoginName(DEFAULT_LOGIN_NAME);
		console.log('No record of previous login found, loggin in as guest');
	}
	console.log(getLoginName() + ' logged in with a score of ' + getScore());
};
Template.leaderboard.created = function() {
}

Template.parent.helpers({
	getTemplate: function() {
		var l = window.location.href;
		if(l.endsWith(URL_HOME)) return Template.home;
		else if(l.endsWith(URL_REGISTER)) if(isLoggedIn()) return Template.dashboard; else return Template.register;
		else if(l.endsWith(URL_SIGNIN)) if(isLoggedIn()) return Template.dashboard; else return Template.signin;
		else if(l.endsWith(URL_LEADERS)) return Template.leaderboard;
		else if(l.endsWith(URL_DASHBOARD)) if(isLoggedIn()) return Template.dashboard; else return Template.signin;
		else if(l.endsWith(URL_CHAT)) if(isLoggedIn()) return Template.chatPanel; else return Template.signin;
		else return Template.notfound;
	}
});

Template.chatPanel.helpers({ getChatList: function(){ return playerList.find({isOnline: true}, {limit: LIM_CHATPANEL}).fetch(); }});

Template.dashboard.helpers({
	username: function(){ return getLoginName() },
	score: function(){ return getScore(); }
});

Template.leaderboard.helpers({
	get: function() { return playerList.find({}, {fields: {username: 1, score: 1}, sort: {score: -1}, limit: LIM_LEADERS}).fetch(); }
});

Template.hotbar.helpers({
	getM: function(){ return text.get(); },
	getLoginData: function(){ return 'Logged in as ' +  getLoginName() + ' with score ' + getScore(); }
});

Template.dashboard.events({
	'click button#logout'(event, instance) {
		console.log('Logout Btn pressed');
		Meteor.call('signout', getLoginName(), getPassword(), function(err, data) {
			setLoginName(DEFAULT_LOGIN_NAME);
			setScore(0);
			text.set("Logged out successfully");
		});
		if(!isLoggedIn()) setPassword('');
	},
	'click button#leaderboard'(event, instance) {
	}
});

Template.chatPanel.events({
	'click .chatBtn': function(event) { console.log("CLIENT + " + this.id); }
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
			if(data[1] !== DEFAULT_LOGIN_NAME) setPassword($("#login_pwd").val());
		});
	},
});

