"use strict";
var Theme;
{

	var sin = Math.sin
	var cos = Math.cos
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

		var now = Date.now()

		ctx.strokeStyle = "#FFFF00"
		for (const keyval of visible.players) {
			const player = keyval[1]
			var arr = player.getXY(now-30)
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
			

			var xa = [5*cos(now/100+1), -10*sin(now/200), -7*sin(now/150+1000), 6*cos(now/300+12), -10*sin(now/230)]
			var ya = [-10*sin(now/200), -7*sin(now/150+1000), 5*cos(now/100), 6*cos(now/300+80), -6*sin(14+now/230)]
			var ra = [4, 3, 4, 2, 3]
		
						ctx.fillStyle = "#227722";


			for(let kek=0; kek<5; kek++)
			{
				ctx.beginPath()
				ctx.arc(window.mousex + xa[kek], window.mousey + ya[kek], ra[kek], 0, 100)
				ctx.closePath()
				ctx.fill()
			}
			// ctx.beginPath()
			// ctx.arc(circle2x, circle2y, 3, 0, 100)
			// ctx.closePath()
			// ctx.fill()

	}
	//The renderer to use:
	proto.render = proto.simplerender
}