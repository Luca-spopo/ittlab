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
		ctx.save();
		// Use the identity matrix while clearing the canvas

	ctx.globalCompositeOperation = "source-over";
	//Lets reduce the opacity of the BG paint to give the final touch
	ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
		///////////////////
				ctx.setTransform(1, 0, 0, 1, 0, 0);
		////////////////////

		ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		// Restore the transform
		ctx.restore();

		///////////////
	//Lets blend the particle with the BG
	ctx.globalCompositeOperation = "lighter";

		//////////////

		ctx.strokeStyle = "#FFFF00"
		for (const keyval of visible.players) {
			const player = keyval[1]
			var arr = player.getXY(Date.now()-30)
			var px = arr[0]
			var py = arr[1]
			
			var color
			///////////
		var gradient = ctx.createRadialGradient(px, py, 0, px, py, player.radius);
		gradient.addColorStop(0, "white");
		gradient.addColorStop(0.4, "white");
			/////////
			//console.log("My id is "+player.localid+" and "+player.name+"'s id is "+player.hislocalid)
			if (player.hislocalid == player.localid)
				color = "#227722";
			else if (player.getRelation(player.localid, player.hislocalid))
				color = "#444477";
			else
				color = "#FF3333";
			//////////////////
			gradient.addColorStop(0.4, color);
			gradient.addColorStop(1, "black");
		ctx.fillStyle = gradient;
		
			////////////////
			ctx.beginPath()
			// console.log(player.id == player.myId, player.hunted)
			//console.log(px, py)
			ctx.arc(px, py, player.radius, 0, 100)
			ctx.closePath()
			ctx.fill()
			ctx.fillStyle = color;
		
			ctx.fillText(player.name, px-player.radius, py-5-player.radius);
		}
	}
	//The renderer to use:
	proto.render = proto.simplerender
}