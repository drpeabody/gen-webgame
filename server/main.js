import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';

Meteor.startup(() => {
	//playerList = new Mongo.Collection('playerList');
});

Meteor.publish(PUB_LEADERS, function (){ return playerList.find({}, {fields: {pass: 0}})});

//playerList.find({}).fetch().forEach((v) => playerList.update(v._id, {$set: {isOnline: false}}));
//console.log(playerList.find({}).fetch());

console.log("server started");

Meteor.methods({
	register: function(name, pwd) {
		if(name === "" || pwd === ""){
			console.log("Register invoked with empty username/password, aborting.");
			return;
		}
		if(playerList){
			console.log("Collection found, Registering user");
			if(playerList.find({username: name}).count() > 0 || name === 'guest'){
				console.log("Registration aborted, duplicate username: " + name);
				msge = name + " username already taken.";
				return;
			}
			playerList.insert({username: name, pass: pwd, score: parseInt(0), isOnline: false});
			
			console.log("User " + name + " registered and loggin out");	
		}
	},
	signin: function(name, pwd) {
		if(name === "" || pwd === ""){
			console.log("Sign in invoked with empty username or password, aborting.");
			return ["Empty username/password", 'guest', 0];
		}
		if(playerList){
			console.log("Collection found, signing in user");
			if(playerList.find({username: name, pass: pwd}).count() != 1 || name === 'guest'){
				console.log("Sign in unsucessful for user: " + name);
				return ["Incorrect username/password", 'guest', 0];
			}
			var v = playerList.find({username: name}).fetch()[0];
			if(v.isOnline){
				console.log("Sign in unseccuessful for user: " + name);
				return ["User already Logged in on some other system", 'guest', 0];
			}
			playerList.update(v._id, {$set: {isOnline: true}});
			return ["Login Successful", name, v.score];
		}	
	},
	signout: function(name, pwd) {
		if(name === "" || pwd === ""){
			console.log("Sign Out invoked with empty username/password.");
			return false;
		}
		if(playerList){
			console.log("Collection found, signing out user");
			if(playerList.find({username: name, pass: pwd}).count() != 1 || name === 'guest'){
				console.log("Sign out unsucessful for user: " + name);
				return false;
			}
			console.log(name + " signed out.");
			var v = playerList.find({username: name}).fetch()[0];
			playerList.update(v._id, {$set: {isOnline: false}});
			return true;
		}
	},
	//Find another player to play with - people with similar batch or score
	//Chat platform
	//Team Chat and private chat along with group chats
	//Stat before and stat after
	//Prep for the multiplayer thing
});
