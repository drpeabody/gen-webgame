import { Meteor } from 'meteor/meteor';
//import { ReactiveVar } from 'meteor/reactive-var';

//Meteor.onClose(() => {
	//playerList.find({}).fetch().forEach((v) => playerList.update(v._id, {$set: {isOnline: false}}));
//});

Meteor.publish(PUB_LEADERS, function (){ return playerList.find({}, {fields: {pass: 0}});});

players = [];//Important: players is sorted according to the 'id' field of the array
//content of the array - [{id: <name>, state: <state>, notif: <communication variable>, room}]

//GameFlow for Client
//Login -> requestGame() -> Listen for changes in getVitalData() -> Retreive Room Key -> call readyForGame() -> wait
//For Server
//Server states:
	//0 - Logged in palying it cool
	//1 - Looking for Game
	//2 - Game found, allotted a room
	//3 - Playing
//Client Login - Add him to the list of players - state set to 0
//Client requestGame() - set state to 1 - look for rooms - if found, add him to the room and return room key - if not found, return "TimeOut" state identifier
//Client readyForGame() - set state to 2 - Cross check for a valid room allotment - initialise game

console.log("server started");

Meteor.methods({
	register: function(name, pwd) {
		if(areEmptyCreds(name, pwd, 'register')) return "Empty Username or Password";
		if(playerList.find({username: name}).count() > 0 || name === 'guest') return "Username already taken";
		playerList.insert({username: name, pass: pwd, score: parseInt(0)});
	},
	signin: function(name, pwd) {
		if(!authenticateCreds(name, pwd)) return ["Incorrect username/password", 'guest', 0];
		//Add Player checks for already signed in cases automatically
		if(addPlayer({id: name, state: 0, notif: ''})) return ["Login Successful", name, playerList.findOne({username: name, pass: pwd}).score];
		else return ["Login failed", 'guest', 0];
	},
	signout: function(name, pwd) {
		if(!authenticateCreds(name, pwd)) return false;
		var v = findSupposedPosOfPlayer(name);
		if(!v.found) return false;
		else {
			removePlayer(v.idx);	
			return true;
		}
	},
	requestGame: function(name, pwd){
		//Todo
	},
	sendMessageToRoom: function(key, author, message){
		//Todo
	},
	getVitalData: function(name, pwd){
		if(!authenticateCreds(name, pwd)) return undefined;
		var v = findSupposedPosOfPlayer(name);
		if(v.found) return players[v.idx].notif;
		else return undefined;
	},
	readyForGame: function(roomKey){
		
		//Check if all players in the room are ready
		//If they are, begin game
	}
	//Stat before and stat after
	//Prep for the multiplayer thing
});

function getWaitingPlayer(){
	//MatchMaking
}	

function authenticateCreds(name, pwd){
	if(areEmptyCreds(name, pwd, 'register')) return false;
	return playerList.find({username: name, pass: pwd}).count() === 1;
}

function hash(text){
	return '#' + text;
}

function isOnline(name){
	return findSupposedPosOfPlayer(name).found;
}

function findSupposedPosOfPlayer(id){
	var low = 0, high = players.length;
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

function areEmptyCreds(name, pwd, fnName){
	if(name === "" || pwd === ""){
		console.log(fnName + " Called with Empty Credentials...");
		return true;
	}
	return false;
}

function addPlayer(objPlayer){
	var v = findSupposedPosOfPlayer(objPlayer.id);
	if(v.found) return false;
	players.splice(v.idx, 0, objPlayer);
	return true;
}
	
