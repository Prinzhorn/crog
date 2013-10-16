(function(window, undefined) {
	var Crog = window.Crog = function(parent, width, height) {
		if(height === undefined) {
			height = width;
		}

		this.containerRatio = width / height;

		this.parent = parent;

		this.container = document.createElement('div');
		this.container.className = 'crog-container';
		this.container.style.cursor = 'move';
		this.container.style.overflow = 'hidden';
		this.container.style.position = 'relative';
		this.container.style.width = width + 'px';
		this.container.style.height = height + 'px';

		this.image = document.createElement('img');
		this.image.className = 'crog-image';
		this.image.style.position = 'absolute';
		this.image.style.left = this.image.style.top = 0;

		this.container.appendChild(this.image);
		this.parent.appendChild(this.container);

		this.bindEvents();
	};

	Crog.fn = Crog.prototype;

	Crog.fn.destroy = function() {
		this.parent.removeChild(this.container);
		this.container.innerHTML = '';
		this.container = undefined;
		this.image = undefined;
	};

	Crog.fn.setURL = function(url) {
		this.loaded = false;

		var _this = this;

		this.image.onload = function() {
			_this.loaded = true;
			_this.resizeImage();
		};

		this.image.src = url;
	};

	Crog.fn.getRect = function() {
		return {
			top: 0,
			right: 0,
			bottom: 0,
			left: 0
		};
	};

	Crog.fn.resizeImage = function() {
		this.image.style.width = 'auto';
		this.image.style.height = 'auto';

		var imageRatio = this.image.clientWidth / this.image.clientHeight;

		if(imageRatio > this.containerRatio) {
			this.image.style.height = '100%';
		} else {
			this.image.style.width = '100%';
		}
	};

	Crog.fn.handleEvent = function(e) {
		e.preventDefault();

		switch(e.type) {
			case 'mousedown':
			case 'touchstart':
				this.drag = true;
				this.startX = e.pageX;
				this.startY = e.pageY;
				this.startImageX = parseInt(this.image.style.left, 10);
				this.startImageY = parseInt(this.image.style.top, 10);
				return;

			case 'mousemove':
			case 'touchmove':
				if(!this.drag) {
					return;
				}

				var dx = e.pageX - this.startX;
				var dy = e.pageY - this.startY;

				this.image.style.left = (this.startImageX + dx) + 'px';
				this.image.style.top = (this.startImageY + dy) + 'px';

				return;

			case 'mouseup':
			case 'touchend':
			case 'touchcancel':
				this.drag = false;

				return;
		}
	};

	Crog.fn.bindEvents = function() {
		this.container.addEventListener('dragstart', this, false);
		this.container.addEventListener('dragstart', this, false);

		this.container.addEventListener('mousedown', this, false);
		this.container.addEventListener('touchstart', this, false);
		this.container.addEventListener('mousemove', this, false);
		this.container.addEventListener('touchmove', this, false);
		this.container.addEventListener('mouseup', this, false);
		this.container.addEventListener('touchend', this, false);
		this.container.addEventListener('touchcancel', this, false);
	};


}(window));