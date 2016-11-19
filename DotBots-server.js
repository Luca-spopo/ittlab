"use strict";

String.prototype.format = function () {
  var args = arguments;
  return this.replace(/\{(\d+)\}/g, function (m, n) { return args[n]; });
};

const byte = function(byte)
{
	if(byte instanceof ArrayBuffer)
		return (new Uint8Array(byte))[0]
	//TODO: cache
	return new Uint8Array([byte])
}

const string = function(str)
{
	return str.toString();
}

let play = {main : ()=>null };//require("server-play")
const dbglog = console.log;
var assert = require('assert')

dbglog("All systems go...")

/*
Modes/Lifecycle of a player:
Registering (Give your name, synch timestamps)
=> Preparing (Spawn location decided, etc, preparations made by server)
=> Playing (Player is playing right now)
=> Dead (Player has died, and camera is lingering)
=> Preparing
*/

{
	const nameCheck = /^[a-z_0-9]{1,10}$/i
	const PlayerTable = new Map(); //WebSocket => Player Details
	const NamePool = new Set();
	//PlayerTable is sent to other modules as context, and is thus const.

	const PlayerFSM = function* ()
	{
		const [player, ws, FSM] = yield; //Bind to these variables, given on connection
		const FSMcall = FSM.next.bind(FSM, FSM);
		assert((yield) == "FSM:getName")
		{	//Get name
			dbglog("Getting name for "+ws.upgradeReq.connection.remoteAddress)
			let name = yield
			while (NamePool.has(name) || !nameCheck.test(name)) //Input name
		 	{
		 		dbglog(ws.upgradeReq.connection.remoteAddress+" gave an invalid name: "+name)
	 			ws.send(byte(1)) //Name invalid
	 			name = yield	
		 	}
	 		NamePool.add(name)
	 		player.name = name;
	 		ws.send(byte(0))
		}
		assert((yield) == "FSM:ts")
	 	{	//Synch timestamps
	 		let min = 9999; //a 10 second max lag is a very reasonable assumption.
	 		let minstart = 0
	 		let minnum = -1
	 		const id = new Buffer([0])
	 		//const pongHandler = (data) => { if(data[0]===id[0]) FSMcall() }
	 		//ws.on("pong", pongHandler)
		 		
	 		for(let i=0; i<10; i++)
	 		{
		 		let start = Date.now()
		 		id[0] = Math.floor(Math.random()*256);
		 		ws.send(id)
		 		//We need to have a mechanism so yield's source is trusted.
		 		//This mechanism is making FSMcall created yields return the FSM
		 		//In the future we will have async/await to deal with this stuff
		 		//TODO: Change the generator mechanism to use asynch/await with nodejs7
		 		//assert(byte(yield) === id[0]); //Wait for pong to callback
		 		yield
		 		let lag = Date.now() - start;
	 			dbglog("Detected lag of: ", lag); //DEBUG:
	 			if(lag < min)
	 			{
	 				min = lag;
	 				minstart = start;
	 				minnum = i;
	 			}
		 	}
		 	//ws.removeListener("pong", pongHandler)
		 	dbglog("Minimum latency: ", min)
		 	//min is the time it takes to send a message to the client
		 	ws.send(string(minstart+min/2)); //This is the time at server side when it reached client.
		 	ws.send(byte(minnum))
		 	
		}
		while(true)
		{
	 	assert((yield) == "FSM:spawning")
	 		ws.send(Math.random(256)) //TODO: Avoid id collisions
	 		while(true)
	 		{
 			assert((yield) == "FSM:playing")
		 		
		 	}
	 	}
	}



	let messageHandler = function(message)
	{
		let details = PlayerTable.get(this)
		dbglog(this.upgradeReq.connection.remoteAddress+" sent "+message)
		details.onMessage.next(message)
	}
	let connectPlayer = function(ws)
	{
		let FSM = PlayerFSM();
		let details = {onMessage : FSM};
		PlayerTable.set(ws, details)
		FSM.next();
		FSM.next([details, ws, FSM])
		ws.on("message", messageHandler)
		//ws.on("close", disconnectHandler)
	}
	let main = function()
	{
		play.main({PlayerTable : PlayerTable});
		exports.connectPlayer = connectPlayer; //Start accepting connections
	}
	exports.main = main;
}