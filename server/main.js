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
	//2 - Game found, alloting a room
	//3 - Playing
//Client Login - Add him to the list of players - state set to 0
//Client requestGame() - set state to 1 - look for rooms - if found, add him to the room, perform final checks and begin game - if not found, return "TimeOut" state identifier

console.log("server started");

Meteor.methods({
	register: function(name, pwd) {
		if(areEmptyCreds(name, pwd, 'register')) return "Empty Username or Password";
		if(playerList.find({username: name}).count() > 0 || name === 'guest') return "Username already taken";
		playerList.insert({username: name, pass: pwd, score: parseInt(0)});
	},
	signin: function(name, pwd) {
		if(!authenticateCreds(name, pwd)) return ["Incorrect username/password", 'guest', 0];
		//addPlayer() checks for already signed in cases automatically
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
		if(!authenticateCreds(name,pwd)) return;
		var v = findSupposedPosOfPlayer(name);
		if(v.found){ if(players[v.idx].state == 0) players[v.idx].state = 1; else console.log("Invalid state for requestGame() by " + name); }
		pl = getWaitingPlayer();
		if(pl == undefined) return;
		
		pl.filter((x) => x.state == 1);
		
		if(pl.length < COUNT_MIN_PLAYERS || pl.length > COUNT_MAX_PLAYERS){
			pl.forEach((x) => x.state = 1);
			return;
		}
		else {
			var key = hash(JSON.parse(pl));
			pl.forEach((x) => {
				x.state = 2;
				x.notif = key;	
			});
		}
		
		//Host Room
		//Set all states to 3
		
	},
	sendMessageToRoom: function(key, author, message){
		//Todo
	},
	getVitalData: function(name, pwd){
		if(!authenticateCreds(name, pwd)) return undefined;
		var v = findSupposedPosOfPlayer(name);
		if(v.found) return players[v.idx].notif;
		else return undefined;
	}
	//Stat before and stat after
});

//For the most general case we might want to get more than one player
//Return undefined if no player is found
//Return Array of references to the player objects in the global
function getWaitingPlayer(num){
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
	
