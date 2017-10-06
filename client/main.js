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
	name = getLoginName();
	score = getScore();
	if(name != null && name != 'guest'){
		console.log('Previous Login Data found, please wait...');
		var l;
		Meteor.call('isLoggedIn', name, function(err, data){ if(!data){
			setDefaults();
			console.log(data + '  ::Previous Login Data invalid, loggin in as guest');
		}});
	}	
	if(score === null || name === null){
		setDefaults();
		console.log('No record of previous login found, loggin in as guest');
	}
	console.log(getLoginName() + ' logged in with a score of ' + getScore());
};

function setDefaults(){
	setLoginName(DEFAULT_LOGIN_NAME);
	setScore(0);
	setPassword('');
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
		else if(l.endsWith(URL_CHATROOM)) if(isLoggedIn()) return Template.chatroom; else return Template.signin;
		else return Template.notfound;
	}
});

Template.chatPanel.helpers({ getChatList: function(){ return playerList.find({isOnline: true}, {limit: LIM_CHATPANEL}).fetch(); }});

Template.dashboard.helpers({
	username: function(){ return getLoginName() },
	score: function(){ return getScore(); }
});

Template.chatroom.helpers({
	getTargetName: function(){ return "**Name**"; }
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
	'click button#startchat': function(event) {
		var name = $("#target").val();
		if(playerList.findOne({username: name}) === undefined){
			text.set("Illegal player name for chat!");
			return;
		}//Publish chat properly.
		Meteor.call('publishChatForUser', getLoginName(), getPassword(), function(err, data){
			console.log('Data Publish Request Made for key: ' + data);
			Meteor.subscribe(data);
			chatList.find({}).fetch().forEach((x) => console.log(x));		
		});
	},
	'click button#send': function(event) {
		var rec = $("#chatRec").val();
		var mes = $("#chatMes").val();
		if(playerList.findOne({username: rec}) === undefined){
			text.set("Illegal player name for chat!");
			return;
		}
		Meteor.call('sendMessage', getLoginName(), getPassword(), rec, mes);
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
			if(data[1] !== DEFAULT_LOGIN_NAME) setPassword($("#login_pwd").val());
		});
	},
});

