function applyAnimationLoop(callback) {

	window.requestAnimationFrame = (function(){
		return
			// Standard
			window.requestAnimationFrame		||
			// Webkit
			window.webkitRequestAnimationFrame	||
			// Mozira
			window.mozRequestAnimationFrame		||
			// Opera
			window.oRequestAnimationFrame		||
			// IE
			window.msRequestAnimationFrame		||
			// Not support
			function(callback, element){
				window.setTimeout(callback, 1000 / 60);
			};
	})();

}
