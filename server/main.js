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
		if(name === "" || pwd === ""){
			msge = "Cannot Register Empy Username or Password";
			return;
		}
		if(playerList){
			console.log("Collection found, Registering user");
			if(playerList.find({username: name}).count() > 0 || name === 'guest'){
				console.log("Registration aborted, duplicate username: " + name);
				msge = name + " username already taken.";
				return;
			}
			playerList.insert({username: name, pass: pwd, score: parseInt(0)});
			msge = "Registered user " + name;	
		}
	},
	signin: function(name, pwd) {
		if(name === "" || pwd === ""){
			msge = "Cannot sign in with empty Username or Password";
			return;
		}
		if(playerList){
			console.log("Collection found, signing in user");
			if(playerList.find({username: name, pass: pwd}).count() != 1 || name === 'guest'){
				console.log("Sign in unsucessful for user: " + name);
				msge = "Cannot sign in, password or username incorrect";
				throw new Meteor.Error(500);
			}
			console.log(name + " signed in.");
			var v = playerList.find({username: name}).fetch()[0];
			msge = "Hi "+name+", Signing in, Please wait..."
			return ["This is message", v.username, v.score];
		}	
	},
	getMsg: function(){ return msge; },
	getChatList: function(){
		return playerList.find({}, {fields: {'username': 1}}).fetch();//Update this function when you want to pass more data, for example filter according to who is online or who isnt
	},
	getLeaderBoardList: function(){
		return playerList.find({}, {fields: {'username': 1, 'score': 1}}).fetch();
	},
	//Find another player to play with - people with similar batch or score
	//Chat platform
	//Team Chat and private chat along with group chats
	//Stat before and stat after
	//Prep for the multiplayer thing
});
