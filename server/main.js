import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';

//Meteor.onClose(() => {
	//playerList.find({}).fetch().forEach((v) => playerList.update(v._id, {$set: {isOnline: false}}));
//});

Meteor.publish(PUB_LEADERS, function (){ return playerList.find({}, {fields: {pass: 0}})});

//playerList.find({}).fetch().forEach((v) => console.log(v));
playerList.find({}).fetch().forEach((v) => playerList.update(v._id, {$set: {isOnline: false}}));
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
	isLoggedIn: function(name) {
		console.log("Log in state queried for user: " + name);
		var v = playerList.find({username: name});
		if(v.count() == 0) console.log(name + ' user not found, they are not logged in.');
		else if(v.count() > 1) console.log(name + ' user found more than once, they are not logged in.');
		else {
			console.log(name + ' user found with login state: ' + v.fetch()[0].isOnline);		
			return v.fetch()[0].isOnline;
		}
		return false;
	},
	publishChatForUser: function(name, pwd){
		console.log('Chat requested for user: ' + name);
		var key = 'Yo';
		var auth = authenticateCreds(name, pwd);
		var login = isLoggedIn(name);
		if(auth && login){
			key = hash(name);			
			Meteor.publish(key, function(){
				return chatList.find({auth: name}, {limit: 10});
			});
			console.log('Chat Published for user: ' + name + ', with key: ' + key);
		}
		else{
			console.log('Chat Access Denied: Authentication: ' + auth + ', Login: ' + login);
		}
		return key;	
	},
	sendMessage: function(author, authorPasswd, receiver, message){
		if(!authenticateCreds(author, authorPasswd)) {
			console.log(author + ' illegally requested to send a message to ' + receiver);
			return;
		}
		chatList.insert({auth: author, rec: receiver, text: message});	
		console.log(author + ' sent a message to ' + receiver);
	}
	//Find another player to play with - people with similar batch or score
	//Chat platform
	//Team Chat and private chat along with group chats
	//Stat before and stat after
	//Prep for the multiplayer thing
});

function authenticateCreds(name, pwd){
	return playerList.find({username: name, pass: pwd}).count() === 1;
}
function isLoggedIn(name) {
	console.log("Log in state queried for user: " + name);
	var v = playerList.find({username: name});
	if(v.count() == 0) console.log(name + ' user not found, they are not logged in.');
	else if(v.count() > 1) console.log(name + ' user found more than once, they are not logged in.');
	else {
		console.log(name + ' user found with login state: ' + v.fetch()[0].isOnline);		
		return v.fetch()[0].isOnline;
	}
	return false;
}

function hash(text){

	return '#' + text;
}
