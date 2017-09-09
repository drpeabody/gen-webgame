import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';

Meteor.startup(() => {
	playerList = new Mongo.Collection('playerList');
	msge = "";
});

Meteor.methods({
	consolelog: function(msg) {
		console.log(msg)
	},
	register: function(name, pwd) {
		if(name == "" || pwd == ""){
			msge = "Cannot Register Empy Username or Password";
			return;
		}
		if(playerList){
			console.log("Collection found, Registering user");
			if(playerList.find({username: name}).count() > 0){
				console.log("Registration aborted, duplicate username: " + name);
				msge = name + " username already taken.";
				return;
			}
			playerList.insert({username: name, pass: pwd, score: parseInt(0)});
			msge = "Registered user " + name;	
		}
	},
	signin: function(name, pwd) {
		if(name == "" || pwd == ""){
			msge = "Cannot sign in with empty Username or Password";
			return;
		}
		if(playerList){
			console.log("Collection found, signing in user");
			if(playerList.find({username: name, pass: pwd}).count() != 1){
				console.log("Sign in unsucessful for user: " + name);
				msge = "Cannot sign in, password or username incorrect";
				throw new Meteor.Error(500);
			}
			console.log(name + " signed in.");
			var v = playerList.find({username: name}).fetch()[0];
			return ["This is message", v.username, v.score];
		}	
	},
	getPlayerList: function() { return playerList; },
	getMsg: function(){ return msge; }
});
