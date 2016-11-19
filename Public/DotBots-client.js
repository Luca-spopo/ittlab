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

/*
Format of the data received from server:
//0:11 - floor(timestamp/10) % 2^12 (40 seconds expressible with resolution 10ms)
(Timestamp will belong either to current integer, next, or previous) (Snap the closest)
0:14 - timestamp % 2^15 (32.7 seconds, resolution 1ms)
15 - Special codes (0 to 1)
	0 - Remote players (mode x)
	1 - Collision (mode y)

x1+0:7 - RemotePlayerID
x1+8:12 - X tile
x1+13:15 - X fraction
x1+16:20 - Y tile
x1+21:23 - Y fraction
x1+24 - ??
//x1+25:31 - Dir

y1+0:7 - RemotePlayerID (Determine client side if you were hunted)
*/


const dbglog = console.log;

{
	var ws, tsDiff, score, visible;

	const makeSensibleDataAndMaybeUpdate = function(data)
	{
		let status = {}
		let data = new Uint8Array(data)
		status.stamp = data[0]>>1; //or /2
		status.collision = (data[0] & 1) == 1; //or %2
		if (status.collision)
			status.id = data[1]
		else
		{
			let visiblePlayers = visible.players
			visiblePlayers.length = 1; //TODO: Use a set //Only self left.
			for(let i=1; i<data.length; i+=3)
			{
				let id = data[i]
				let x = data[i+1]/8
				let y = data[i+2]/8
				p = Player.getById(id)
				if (p)
					p.update(x, y, 0, status.stamp)
				else
					p = new Player(id, x, y, 0, status.stamp)
				visiblePlayers.push(id);
			}
		}
		return status
	}


	const serverTime = function()
	{
		return Date.now() + tsDiff
	}

	const PlayerFSM = function* ()
	{
		const [ws, FSM] = yield;
		const FSMcall = FSM.next.bind(FSM, FSM);
		ws.send("FSM:getName")
		{	//Get name
			let name = prompt("Enter name: ")
			ws.send(name)
			while (byte(yield) != 0) //Input name
		 	{
	 			name = prompt("Enter another name: ")
	 			ws.send(name)
		 	}
		}
		ws.send("FSM:ts")
		{	//Synch timestamps
			let stamps = []
			for(let i=0; i<10; i++)
			{
				let temp = yield
				stamps.push(Date.now())
				ws.send(temp)
			}
			tsDiff = Number.parseInt(yield) - stamps[byte(yield)];
			dbglog("Server timestamp is "+serverTime()+" and tsDiff is "+tsDiff)
		}
		while(true)
		{
			ws.send("FSM:spawning")
			{
				//Wait for formalities
				Player.localid = yield
				//let namelist = yield
				//Now we're talking
				ws.send("FSM:playing")
				startSendingLocalData(); //implement
				while(true)
				{
					let status = yield
					if (typeof(status) == "string")
						chatbox(status)
					else
					{
						status = makeSensibleDataAndMaybeUpdate(status)
						if (status.collision)
							if (Player.getRelation(Player.localid, status.id))
							{
								//Win condition
								score++;
							}
							else
							{
								//Lose condition
								score = 0;
								stopSendingLocalData()
								break; //you die.
							}
						// else
						// 	updateVisible(status.list);
					}
				}
			}
		}
	}

	//Updates the Maps in visible, as per given data.
	let receiveUpdate  = function(data, visible)
	{
		//Receives all the nearby players and drops, with their coords relative to local player
		/*
		abs_dir is basically the player's input.
		Client acts upon input immidiately.
		Let REAL TIME be defined as the time when a client inputs on his local machine.
		Server runs the entire world C1 ms late, and detects collisions
		C1 is the maximum lag between server and client, nerfed to a realistic value.
		Client runs 2*C1 ms in the past.
		Client, while playing 2*C1 in the past, would be getting accurate world information at constant delay.
		"Not getting hunted" would be given priority over being hunted. Not being able to escape because of lag is worse than not being able to hunt because of lag.
		If a client DCs, then extrapolation using last known inputs is canonical, and client will be reset to canonical position when he reconnects.
		No jumping tolerated.

		http://buildnewgames.com/real-time-multiplayer/
		*/

	}
	//If there are two already in queue,
	//then one is removed before sending the next one.
	let sendUpdate = function(visible)
	{
		//Send dl,theta,dt,abs_dir for local player since last synch
		//Each of those 4 values is represented by a byte.
		//dl is mapped from 0 to dt*speed, theta is mapped from 0 to 2PI, dt is time since last synch, abs_dir is last known direction
		//This dl,dq should theoretically provide more resolution than dx,dy, since dxdy can contain invalid info
	}
	var curTime = Date.now();
	function main()
	{
		ws = new WebSocket(location.href.replace(location.protocol, "ws:"))
		let FSM = PlayerFSM();
		ws.onopen = function()
		{
			console.log("WS Connected successfully")
			FSM.next()
			FSM.next([ws, FSM])
		}
		ws.onerror = function()
		{
			document.body.innerHTML = "Sorry, could not establish WebSocket connection"	
		}
		ws.binaryType = 'arraybuffer';
		ws.onmessage = function(message)
		{
			message = message.data
			if (typeof(message)=="string")
				dbglog("WS got message: "+message)
			else
				dbglog("WS got message: "+(new Uint8Array(message)))
			FSM.next(message)
		}
		

		let canvas = document.createElement("canvas")
		canvas.height = 400
		canvas.width = 600
		document.body.appendChild(canvas)
		let theme = new Theme(canvas)
		visible = new Visible()
		// visible.players.set(0, new Player(0, 200, 200, 3, curTime))
		// visible.players.set(1, new Player(1, 60, 110, 4, curTime))
		// visible.players.set(2, new Player(2, 110, 210, 4, curTime))
		new Player(0, 200, 200, 3, curTime)
		new Player(0, 200, 200, 3, curTime)
		function renderLoop()
		{
			curTime = Date.now();
			theme.simplerender(visible)
			window.requestAnimationFrame(renderLoop)
		}
		window.requestAnimationFrame(renderLoop)
	}
	window.onload = main
}