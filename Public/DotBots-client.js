"use strict";

/*
<div id="chatbox"></div>
<input type="text" id="inputbox"></input>
<input type="button" id="button" value="Chat!"></input>
*/

var chatbox, button, inputbox

var score = 0
{
	let URL = location.href.replace(location.protocol, "ws:")
	var ws, localplayer;


	let loseH = function()
	{
		score = 0
		document.getElementById("score").innerHTML = score
		Player.prototype.localid = localplayer.hislocalid = Math.floor(Math.random()*25600)
		localplayer.x = Math.random()*300
		localplayer.y = Math.random()*300
	}

	const PlayerFSM = function* ()
	{
		const [player, ws, FSM] = yield;
		const FSMcall = FSM.next.bind(FSM, FSM);
		{	//Get name
			let name = prompt("Enter name: ")
			while ((yield) != 0) //Input name
		 	{
	 			name = prompt("Enter another name: ")
		 	}
		}
		{	//Synch timestamps
	 		let min = 9999;
	 		const id = new Buffer([0])
	 		const pongHandler = (data) => { if(data[0]===id[0]) FSMcall() }
	 		ws.on("pong", pongHandler)
		 		
	 		for(let i=0; i<10; i++)
	 		{
		 		let lag = Date.now()
		 		id[0] = Math.floor(Math.random()*256);
		 		ws.ping(id)
		 		//We need to have a mechanism so yield's source is trusted.
		 		//This mechanism is making FSMcall created yields return the FSM
		 		assert(FSM === (yield)); //Wait for pong to callback
		 		lag = Date.now() - lag;
	 			dbglog("Detected lag of: ", lag); //DEBUG:
	 			if(lag < min)
	 				min = lag;
		 	}
		 	ws.removeListener("pong", pongHandler)
		 	dbglog("Minimum latency: ", min)
		 	//min is the time it takes to send a message to the client
		}
	}

	//Visible class
	var Visible
	{
		Visible =  function()
		{
			this.players = new Map() //Ordered list of Players with coords relative to player
			this.drops = new Map()
		}
	}
	//Network managing class
	{
		function NetworkManager()
		{

		}
		let proto = NetworkManager.prototype
		
		//Agrees on a timestamp value
		proto.synchStamp = function()
		{
			socket.emit('ping', Date.now(), function(startTime) {
			    var latency = Date.now() - startTime;
			    console.log(latency);
			});
		}

		//Updates the Maps in visible, as per given data.
		proto.receiveUpdate  = function(data, visible)
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
		proto.sendUpdate = function(visible)
		{
			//Send dl,theta,dt,abs_dir for local player since last synch
			//Each of those 4 values is represented by a byte.
			//dl is mapped from 0 to dt*speed, theta is mapped from 0 to 2PI, dt is time since last synch, abs_dir is last known direction
			//This dl,dq should theoretically provide more resolution than dx,dy, since dxdy can contain invalid info
		}
	}
	var curTime = Date.now();
	function main()
	{
		ws = new WebSocket(URL)
		ws.onopen = function()
		{
			console.log("WS Connected")

		}
		ws.onerror = function()
		{
			document.body.innerHTML = "Sorry, could not establish WebSocket connection"	
		}	
		

		let canvas = document.createElement("canvas")
		canvas.height = 400
		canvas.width = 600
		document.body.appendChild(canvas)
		let theme = new Theme(canvas)
		let visible = new Visible()
		 //new Player(0, Math.random()*300, Math.random()*300, 3, curTime)
		//let p2 = new Player(1, 60, 110, 4, curTime)
		//visible.players.set(0, localplayer)

		inputbox = document.createElement("input")
		inputbox.setAttribute("type", "text")
		document.body.appendChild(inputbox)
		button = document.createElement("input")
		button.setAttribute("type", "button")
		button.setAttribute("value", "Chat!")
		document.body.appendChild(button)
		chatbox = document.createElement("hr")
		document.body.appendChild(chatbox)
		chatbox = document.createElement("div")
		document.body.appendChild(chatbox)
		

// 		document.write(
// 			`
// <div id="chatbox"></div>
// <input type="text" id="inputbox"></input>
// <input type="button" id="button" value="Chat!"></input>
// 			`)

		var nameTable = []
		let kek = function(e)
		{
			e = e.data

			if (e.charAt(0) == "%")
			{
				// let chatbox = document.getElementById("chatbox")
				chatbox.innerHTML = chatbox.innerHTML+"<br />"+e.substr(1)
				return
			}
			if (e.charAt(0) == "&")
			{
				// let chatbox = document.getElementById("chatbox")
				if(e.substr(1).split(":")[0]==localplayer.id)
					loseH();
				return
			}

			let name = e.split(":")[3]
			e = e.split(":").map(Number)
			let hislocalid = e[4]
			if (visible.players.get(e[0]))
			{
				let p = visible.players.get(e[0])
				//console.log(p)
				p.x = e[1]
				p.y = e[2]
				p.hislocalid = hislocalid
				if ( hislocalid == Player.prototype.localid)
					Player.prototype.localid = localplayer.hislocalid = Math.floor(Math.random()*25600)

				let dist = (localplayer.x-p.x)*(localplayer.x-p.x) + (localplayer.y-p.y)*(localplayer.y-p.y)
				//console.log("Distance between me and " + p.name + " is " + dist + " and 4R^2 is " + 4*localplayer.radius*localplayer.radius)
				if (dist < 4*localplayer.radius*localplayer.radius)
				{
					if(localplayer.getRelation(localplayer.localid, hislocalid))
					{
						score++
						document.getElementById("score").innerHTML = score
						p.x = -400
						p.y = -400
						ws.send("&"+p.id+":"+localplayer.name+":"+score)
					}
				}
			}
			else
			{
				if (nameTable[name])
					visible.players.set(nameTable[name], null)
				visible.players.set(e[0], new Player(e[0], e[1], e[2], 0, curTime, name, hislocalid))
				nameTable[name] = e[0]
			}
		}

		//visible.players.set(1, p2)
		let speed = 5
		window.mousex =  0
		window.mousey = 0
		let lastTime = Date.now()
		//visible.players.set(2, new Player(2, 110, 210, 4, curTime))
		function renderLoop()
		{
			curTime = Date.now();
			theme.simplerender(visible)
			localplayer.x += Math.min(Math.max(window.mousex - localplayer.x, -speed), speed)
			localplayer.y += Math.min(Math.max(window.mousey - localplayer.y, -speed), speed)
			if (curTime - lastTime > 40)
			{
				lastTime = curTime
				ws.send(localplayer.id.toString()+":"+localplayer.x.toString()+":"+localplayer.y.toString()+":"+localplayer.name.toString()+":"+Player.prototype.localid)
			}
			window.requestAnimationFrame(renderLoop)
		}
		window.setInterval(function()
		{
			for (const keyval of visible.players) {
				const player = keyval[1]
				player.update(player.x, player.y, Date.now())
			}
		}, 5)
		ws.onmessage = function(e)
		{
			let localname = window.prompt("Please enter your name: ")
			let id = Number(e.data)
			localplayer = new Player(id, Math.random()*300, Math.random()*300, 3, curTime, localname)
			console.log("Setting localid to "+id)
			Player.prototype.localid = id
			visible.players.set(id, localplayer)
			ws.onmessage = kek
			button.onclick = function()
			{
				let ipb = inputbox
				// let ipb = document.getElementById("inputbox")
				// let chatbox = document.getElementById("chatbox")
				chatbox.innerHTML = chatbox.innerHTML+"<br />"+localplayer.name+": "+ipb.value
				ws.send("%"+localplayer.name+": "+ipb.value)
				ipb.value = ""
			}
			window.requestAnimationFrame(renderLoop)
		}
	}
	window.onload = main
	window.onmousemove = function(event)
	{
		window.mousex = event.clientX
		window.mousey = event.clientY
	}
}