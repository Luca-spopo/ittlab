"use strict";

let IS_NODE = typeof window === 'undefined'

var Player
{
	let sin = Math.sin
	let cos = Math.cos

	//Player class
	Player = function(id, x, y, dir, stamp, name, hislocalid)
	{
		this.hislocalid = hislocalid || id
		this.direction = dir;
		this.id = id;
		this.x = x
		this.name = name
		this.y = y
		this.xs = [x, x]
		this.ys = [y, y]
		this.stamps = [Date.now(), Date.now()-50]

		if (!IS_NODE)
			this.hunted = Player.prototype.getRelation(Player.prototype.myId, id)
	}
	let proto = Player.prototype
	proto.localid = Math.floor(Math.random()*256)
	proto.radius = 20
	proto.speed = 2
	proto.getRelation = function(id1, id2) //True <=> id1 hunts id2
	{
		let con1 = id1 > id2
		let con2 = (id1 + id2)%2 == 1
		return con1 ? con2 : !con2
	}
	proto.getXY = function(stamp)
	{
		let dir = this.direction*Math.PI/128
		let i=0;
		for(i=0; i<this.stamps.length && this.stamps[i] > stamp; i++); //stamps[i] is older than stamp
		//console.log(stamp, this.stamps[0])
		if (i==0) //even the latest one is older
		{
			let dt = (stamp - this.stamps[0])/1000
			return [this.xs[0] + cos(dir)*this.speed*dt, this.ys[0] + sin(dir)*this.speed*dt]
		}
		let newstamp = this.stamps[i-1], oldstamp = this.stamps[i]
		let newx = this.xs[i-1], oldx = this.xs[i]
		let newy = this.ys[i-1], oldy = this.ys[i]
		let kek = (stamp-oldstamp)/(newstamp-oldstamp)
		//console.log(oldx, kek, newx, oldy, newy)
		return [oldx + kek*(newx-oldx), oldy + kek*(newy-oldy)]
	}
	let stateBufferLimit = 10
	proto.update = function(x, y, stamp)
	{
		this.xs.unshift(x)
		this.xs.length = stateBufferLimit;
		this.ys.unshift(y)
		this.ys.length = stateBufferLimit;
		this.stamps.unshift(stamp)
		this.stamps.length = stateBufferLimit;
		//this.direction = dir
	};

	if(IS_NODE)
		module.exports = Player
}