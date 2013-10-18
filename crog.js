(function(window, undefined) {
	var Crog = window.Crog = function(parent, width, height) {
		if(height === undefined) {
			height = width;
		}

		this.containerWidth = width;
		this.containerHeight = height;
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
		this.image.style.display = 'block';

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

	Crog.fn.setURL = function(url, fn) {
		this.loaded = false;

		var _this = this;

		this.image.onload = function() {
			_this.imageRatio = _this.image.naturalWidth / _this.image.naturalHeight;
			_this.needsCrop = _this.imageRatio !== _this.containerRatio;

			if(!fn || fn.call(_this) !== false) {
				_this.image.style.visibility = 'visible';
				_this.loaded = true;
				_this.resizeImage();
			}
		};

		this.image.style.visibility = 'hidden';
		this.image.src = url;
	};

	Crog.fn.getRect = function() {
		var left = Math.abs(parseInt(this.image.style.left, 10));
		var top = Math.abs(parseInt(this.image.style.top, 10));

		var scaledImageWidth;
		var scaledImageHeight;

		if(this.imageRatio > this.containerRatio) {
			scaledImageHeight = this.containerHeight;
			scaledImageWidth = scaledImageHeight * this.imageRatio;
		} else {
			scaledImageWidth = this.containerWidth;
			scaledImageHeight = scaledImageWidth / this.imageRatio;
		}

		return {
			top: top / scaledImageHeight,
			right: (left + this.containerWidth) / scaledImageWidth,
			bottom: (top + this.containerHeight) / scaledImageHeight,
			left: left / scaledImageWidth
		};
	};

	Crog.fn.resizeImage = function() {
		this.image.style.width = 'auto';
		this.image.style.height = 'auto';
		this.image.style.left = this.image.style.top = 0;

		if(this.imageRatio > this.containerRatio) {
			this.image.style.height = '100%';
		} else {
			this.image.style.width = '100%';
		}
	};

	Crog.fn.handleEvent = function(e) {
		if(e.preventDefault) {
			e.preventDefault();
		} else {
			e.returnValue = false;
		}

		if(!this.loaded) {
			return;
		}

		var pageX;
		var pageY;

		if(e.touches && e.touches.length) {
			pageX = e.touches[0].pageX;
			pageY = e.touches[0].pageY;
		} else {
			pageX = e.pageX;
			pageY = e.pageY;
		}

		switch(e.type) {
			case 'mousedown':
			case 'touchstart':
				this.drag = true;
				this.startX = pageX;
				this.startY = pageY;
				this.startImageX = parseInt(this.image.style.left, 10);
				this.startImageY = parseInt(this.image.style.top, 10);
				return;

			case 'mousemove':
			case 'touchmove':
				if(!this.drag) {
					return;
				}

				var dX = pageX - this.startX;
				var dY = pageY - this.startY;
				var targetX = Math.max(Math.min(this.startImageX + dX, 0), this.containerWidth - this.image.clientWidth);
				var targetY = Math.max(Math.min(this.startImageY + dY, 0), this.containerHeight - this.image.clientHeight);

				this.image.style.left = targetX + 'px';
				this.image.style.top = targetY + 'px';

				return;

			case 'mouseup':
			case 'touchend':
			case 'touchcancel':
				this.drag = false;
				return;
		}
	};

	Crog.fn.bindEvents = function() {
		this.addEvent(this.container, 'dragstart', this, false);

		this.addEvent(this.container, 'mousedown', this, false);
		this.addEvent(this.container, 'touchstart', this, false);
		this.addEvent(this.container, 'mousemove', this, false);
		this.addEvent(this.container, 'touchmove', this, false);

		this.addEvent(window, 'mouseup', this, false);
		this.addEvent(window, 'touchend', this, false);
		this.addEvent(window, 'touchcancel', this, false);
	};

	Crog.fn.addEvent = function(element, name, callback) {
		if(element.addEventListener) {
			element.addEventListener(name, callback, false);
		} else {
			element.attachEvent('on' + name, callback);
		}
	};

}(window));