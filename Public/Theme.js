"use strict";
var Theme;
{
	//Theme class
	Theme = function(canvas)
	{
		this.canvas = canvas
		this.ctx2D = canvas.getContext("2d")		
	}
	let proto = Theme.prototype
	let Pi2 = Math.PI * 2
	proto.simplerender = function(visible) {
		let ctx = this.ctx2D
		ctx.clearRect(0, 0, this.canvas.height, this.canvas.width)
		ctx.strokeStyle = "#FFFF00"
		for (const keyval of visible.players) {
			const player = Player.getById(keyval)
			if (player.id == player.localid)
				ctx.fillStyle = "#227722";
			else if (player.hunted)
				ctx.fillStyle = "#444477";
			else
				ctx.fillStyle = "#FF3333";
			ctx.beginPath()
			// console.log(player.id == player.localid, player.hunted)
			ctx.arc(player.x, player.y, player.radius, 0, 100)
			ctx.closePath()
			ctx.fill()	
		}
	}
	//The renderer to use:
	proto.render = proto.simplerender
}