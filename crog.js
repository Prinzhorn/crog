(function(window, undefined) {
	var Crog = window.Crog = function(parent, width, height) {
		if(height === undefined) {
			height = width;
		}

		this.containerWidth = width;
		this.containerHeight = height;
		this.containerRatio = width / height;
		this.imageX = 0;
		this.imageY = 0;
		this.fit = false;

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

	Crog.fn.setFit = function(fit) {
		this.fit = fit;

		this.container.style.cursor = this.fit ? '' : 'move';

		this.resizeImage();
	};

	Crog.fn.getRect = function() {
		if(this.fit) {
			throw 'You cannot call getRect when in fitting mode.';
		}

		var left = Math.abs(this.imageX);
		var top = Math.abs(this.imageY);

		return {
			top: top / this.scaledImageHeight,
			right: (left + this.containerWidth) / this.scaledImageWidth,
			bottom: (top + this.containerHeight) / this.scaledImageHeight,
			left: left / this.scaledImageWidth
		};
	};

	Crog.fn.resizeImage = function() {
		var _this = this;

		_this.image.style.width = 'auto';
		_this.image.style.height = 'auto';
		_this.imageX = _this.imageY = 0;

		_this.disableTransitions();
		_this.transformImage();

		window.setTimeout(function() {
			if((_this.imageRatio > _this.containerRatio && !_this.fit) || (_this.imageRatio < _this.containerRatio && _this.fit)) {
				_this.scaledImageHeight = _this.containerHeight;
				_this.scaledImageWidth = _this.scaledImageHeight * _this.imageRatio;

				_this.image.style.height = '100%';
				_this.imageX = ((_this.containerWidth - _this.scaledImageWidth) / 2);
			} else {
				_this.scaledImageWidth = _this.containerWidth;
				_this.scaledImageHeight = _this.scaledImageWidth / _this.imageRatio;

				_this.image.style.width = '100%';
				_this.imageY = ((_this.containerHeight - _this.scaledImageHeight) / 2);
			}

			_this.enableTransitions();
			_this.transformImage();
		}, 0);
	};

	Crog.fn.transformImage = function() {
		this.image.style.transform = this.image.style.webkitTransform = 'translate(' + this.imageX + 'px, ' + this.imageY + 'px)';
	};

	Crog.fn.enableTransitions = function() {
		if(this.fit) {
			return;
		}

		this.image.style.webkitTransition = '-webkit-transform 1s';
		this.image.style.transition = 'transform 1s';
	};

	Crog.fn.disableTransitions = function() {
		this.image.style.webkitTransition = '-webkit-transform 0s';
		this.image.style.transition = 'transform 0s';
	};

	Crog.fn.handleEvent = function(e) {
		if(e.target === this.container || e.target === this.image) {
			if(e.preventDefault) {
				e.preventDefault();
			} else {
				e.returnValue = false;
			}
		}

		if(!this.loaded || this.fit) {
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
				this.startImageX = this.imageX;
				this.startImageY = this.imageY;
				this.disableTransitions();
				return;

			case 'mousemove':
			case 'touchmove':
				if(!this.drag) {
					return;
				}

				var dX = pageX - this.startX;
				var dY = pageY - this.startY;
				this.imageX = Math.max(Math.min(this.startImageX + dX, 0), this.containerWidth - this.image.clientWidth);
				this.imageY = Math.max(Math.min(this.startImageY + dY, 0), this.containerHeight - this.image.clientHeight);

				this.transformImage();

				return;

			case 'mouseup':
			case 'touchend':
			case 'touchcancel':
				this.drag = false;
				return;
		}
	};

	Crog.fn.bindEvents = function() {
		this.addEvent(this.container, 'dragstart', this);

		this.addEvent(this.container, 'mousedown', this);
		this.addEvent(this.container, 'touchstart', this);

		this.addEvent(this.container, 'mousemove', this);
		this.addEvent(this.container, 'touchmove', this);

		this.addEvent(window, 'mouseup', this);
		this.addEvent(window, 'touchend', this);
		this.addEvent(window, 'touchcancel', this);
	};

	Crog.fn.addEvent = function(element, name, callback) {
		if(element.addEventListener) {
			element.addEventListener(name, callback, false);
		} else {
			element.attachEvent('on' + name, callback);
		}
	};

}(window));