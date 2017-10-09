import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';

//Meteor.onClose(() => {
	//playerList.find({}).fetch().forEach((v) => playerList.update(v._id, {$set: {isOnline: false}}));
//});

Meteor.publish(PUB_LEADERS, function (){ return playerList.find({}, {fields: {pass: 0}})});

players = [];//List of signed in players, always sorted

//playerList.find({}).fetch().forEach((v) => console.log(v));
//playerList.find({}).fetch().forEach((v) => playerList.update(v._id, {$set: {isOnline: false}}));
//console.log(playerList.find({}).fetch());

//GameFlow for Client
//Login -> requestGame() -> Listen for changes in getVitalData() -> Retreive Room Key -> call readyForGame() -> wait
//For Server
//Client Login - Add him to the list of players isPlaying - false, isLookingForGame - false, notif - ####
//Client requestGame() - isLookingForGame - true, matchmaking, if players found, create room, set all notifs to roomKey 
//Client readyForGame() - isLookingForGame - false, isPlaying - true, set all Notifs to establish direct Connection to other players

console.log("server started");

Meteor.methods({
	register: function(name, pwd) {
		if(areEmptyCreds(name, pwd, 'register') return;
		if(playerList.find({username: name}).count() > 0 || name === 'guest'){
			console.log("Registration aborted, duplicate username: " + name);
			msge = name + " username already taken.";
			return;
		}
		playerList.insert({username: name, pass: pwd, score: parseInt(0)});
		console.log("User " + name + " registered and loggin out");	
	},
	signin: function(name, pwd) {
		if(areEmptyCreds(name, pwd, 'signin') return ["Empty username/password", 'guest', 0];
		if(!authenticateCreds(name, pwd)){
			console.log("Access Denied: Sign in unsucessful for " + name);
			return ["Incorrect username/password", 'guest', 0];
		}
		if(isOnline(name)){
			console.log("Sign in unseccuessful for user: " + name);
			return ["User already Logged in on some other system", 'guest', 0];
		}
		addPlayer({id: name, isPlaying: false, isLookingForGame: false, notif: 'Nope'}); 
		//notif is changed to the RoomKey when a match is found and a room is generated - This is how client is notified of the matchmaking
		//Client should call readyForGame() to set isPlaying to true, allowing for syncing before starting game
		//isLookingForGame is used in matchmaking
		//Client should regularly query the notif tag for update if a game is found
		return ["Login Successful", name, v.score];	
	},
	signout: function(name, pwd) {
		if(areEmptyCreds(name, pwd, 'register') return false;
		if(!authenticateCreds(name, pwd)){
			console.log("Access Denied: Sign out unsucessful for " + name);
			return false;
		}
		console.log(name + " signed out.");
		var v = findSupposedPosOfPlayer(name);
		if(!v.found){
			console.log(name + '\'s Login Entry not Found.');
			return false;
		}
		else {
			removePlayer(v.idx);	
			return true;
		}
	},
	requestGame: function(name, pwd){
		if(areEmptyCreds(name, pwd, 'register') return false;
		if(!authenticateCreds(name, pwd)){
			console.log("Access Denied: Sign out unsucessful for " + name);
			return false;
		}
		var v = findSupposedPosOfPlayer(name);
		if(!v.found){
			console.log(name + '\'s Login Entry not Found.');
			return false;
		}
		else{
			players[v.idx].isLookingForGame = true;
			opponent = getWaitingPlayer();
			//This function should not return anything. This is a request, client should query getVitalData() to learn about the reply
			//If player is found hostRoom() an change notif for all the players to roomKey
			//Otherwise return error
		}
	},
	sendMessageToRoom: function(key, author, message){
		chatList.insert({AccessToken: key, author: author, message: message});
	},
	getVitalData: function(name, pwd){
		var v = findSupposedPosOfPlayer(name);
		if(v.found) return players[v.idx].notif; 
		else return 'Nope'
	},
	readyForGame: function(){
		
		//Check if all players in the room are ready
		//If they are, begin game
	}
	//Stat before and stat after
	//Prep for the multiplayer thing
});

function getWaitingPlayer(){
	//MatchMaking
}

function hostRoom(){
	Meteor.publish(PUB_CHAT, function(){ return chatList.find({AccessToken: key}); });
	return hash(new Date().getTime());
}
	

function authenticateCreds(name, pwd){
	return playerList.find({username: name, pass: pwd}).count() === 1;
}

function hash(text){
	return '#' + text;
}

function isOnline(name){
	return findSupposedPosOfPlayer(name).found;
}

function findSupposedPosOfPlayer(id){
	low = 0, high = players.length;
	while(low != high){
		med = parseInt((high + low)/2);
		if(players[med].id < id) high = med;
		else if(players[med].id > id) low = med;
		else if(players[med].id == id) return {found: true, idx: med};
	}
	return {found: false, idx: high};
}

function removePlayer(idx){
	players.splice(idx, 1);
}

function areEmptyCreds(name, pwd, f){
	if(name === "" || pwd === ""){
		console.log(f + " Called with Empty Credentials...");
		return true;
	}
	return false;
}

function addPlayer(l){
	//Add sorting add code here
}
	
