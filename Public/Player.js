"use strict";

let IS_NODE = typeof window === 'undefined'

var Player
{
	let sin = Math.sin
	let cos = Math.cos

	//Player class
	Player = function(id, x, y, dir, stamp, name)
	{
		this.direction = dir;
		this.id = id;
		this.x = x
		this.name = name
		this.y = y
		this.stamps = [x, x]
		this.xs = [y, y]
		this.ys = [stamp-50, stamp]
		if (!IS_NODE)
			this.hunted = Player.prototype.getRelation(Player.prototype.myId, id)
	}
	let proto = Player.prototype
	proto.localid = Math.floor(Math.random()*256)
	proto.radius = 20
	proto.speed = 0.2
	proto.getRelation = function(id1, id2) //True <=> id1 hunts id2
	{
		let con1 = id1 > id2
		let con2 = (id1 + id2)%2 == 1
		return con1 ? con2 : !con2
	}
	console.log(proto.getRelation(3, 4))
	console.log(proto.getRelation(4, 3))
	proto.update = function(x, y, dir, stamp)
	{
		let xs = this.xs
		xs[1] = xs[2]
		xs[2] = x;
		let ys = this.ys
		ys[1] = ys[2]
		ys[2] = y;
		let stamps = this.stamps
		stamps[1] = stamps[2]
		stamps[2] = stamp;
	};

	if(IS_NODE)
		module.exports = Player
}