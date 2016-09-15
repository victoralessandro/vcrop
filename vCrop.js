var VCrop = (function () {
	var canvas = document.createElement('canvas');
	var context = canvas.getContext('2d');
	var mousePos = {
		'x': 0,
		'y': 0
	};
	var mouseDownPos = null;
	var currentActionFunc = null;
	var extensions = ["jpg", "png"];
	function VCrop (initOptions) {
		this.options = {
			'width': 0,
    		'height': 0,
    		'selector': {
    			'width': 0,
    			'height': 0,
    			'minWidth': 0,
    			'minHeight': 0,
    			'maxWidth': 0,
    			'maxHeight': 0
    		},
    		'proportion': null,
    		'image': new Image(),
    		'container': null,
    		'aspectRatio': null,
    		'resizable': true
		};
		this.selectionArea = {
            'x': 0,
            'y': 0,
            'width': 0,
            'height': 0
        };
		this.options = margeJson(this.options, initOptions);
		this.selectionArea.width = this.options.selector.width;
		this.selectionArea.height = this.options.selector.height;

		this.options.container.appendChild(canvas); 

		this.options.image.crossOrigin = 'anonymous';

		if (this.options.aspectRatio != null) {
			var aspect = this.options.aspectRatio.split(':');
			aspect[0] = parseInt(aspect[0]); 
			aspect[1] = parseInt(aspect[1]);
			if ((aspect[0] / aspect[1]) != (this.selectionArea.width / this.selectionArea.height)) {
				throw "Selector size problem";
			}
			this.options.aspectRatio = aspect;
		}
	}

	function mouseDown(e) {
		mouseIsDown = true;
	 	mouseDownPos = getMousePos(canvas, e);
	}
	
	function mouseUp (e) {
		mouseDownPos = null;
		currentActionFunc = null;
	}

	function mouseMove (e) {
    	mousePos = getMousePos(canvas, e);
    	if (currentActionFunc != null) {
    		currentActionFunc.call();
    		return;
    	}
    	var message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;
    	var xSA = this.selectionArea.x, ySA = this.selectionArea.y;
    	var wSA = this.selectionArea.width, hSA = this.selectionArea.height;
    	
    	if ((mousePos.x >= this.selectionArea.x + 5 && mousePos.x <= this.selectionArea.x + this.selectionArea.width - 5) && (mousePos.y >= this.selectionArea.y + 5 && mousePos.y <= this.selectionArea.y + this.selectionArea.height - 5)) {
        	canvas.style.cursor = 'move';
        	if (mouseDownPos != null) {
        		currentActionFunc = moveSelectionArea.bind(this);
        	}
        } else if (this.options.resizable) {
        	canvas.style.cursor = 'default';

        	if (numberIsInRange(mousePos.x, xSA - 5, xSA + 5) && numberIsInRange(mousePos.y, ySA + 5, ySA + hSA- 5)) {
        		canvas.style.cursor = 'w-resize';
        		if (mouseDownPos != null) {
        			currentActionFunc = resizeSelectionArea.bind(this, 'w', 'l');
        		}
            } else if (numberIsInRange(mousePos.x, xSA + wSA - 5, xSA + wSA + 5) && numberIsInRange(mousePos.y, ySA + 5, ySA + hSA- 5)) {
            	canvas.style.cursor = 'w-resize';
            	if (mouseDownPos != null) {
            		currentActionFunc = resizeSelectionArea.bind(this, 'w', 'r');
            	}
            } else if (numberIsInRange(mousePos.y, ySA - 5, ySA + 5) && numberIsInRange(mousePos.x, xSA + 5, xSA + wSA- 5)) {
            	canvas.style.cursor = 'n-resize';
            	if (mouseDownPos != null) {
            		currentActionFunc = resizeSelectionArea.bind(this, 'h', 't');
            	}
            } else if (numberIsInRange(mousePos.y, ySA + hSA - 5, ySA + hSA + 5) && numberIsInRange(mousePos.x, xSA + 5, xSA + wSA- 5)) {
            	canvas.style.cursor = 'n-resize';
            	if (mouseDownPos != null) {
            		currentActionFunc = resizeSelectionArea.bind(this, 'h', 'b');
            	}	
            } else if (numberIsInRange(mousePos.x, xSA - 5, xSA + 5) && numberIsInRange(mousePos.y, ySA - 5, ySA + 5)) {
            	canvas.style.cursor = 'se-resize';
            	if (mouseDownPos != null) {
            		currentActionFunc = resizeSelectionArea.bind(this, 'wh', 'tl');
            	}            	
            } else if (numberIsInRange(mousePos.x, xSA + wSA - 5, xSA + wSA + 5) && numberIsInRange(mousePos.y, ySA + hSA - 5, ySA + hSA + 5)) {
            	canvas.style.cursor = 'se-resize';
            	if (mouseDownPos != null) {
            		currentActionFunc = resizeSelectionArea.bind(this, 'wh', 'br');
            	}
            } else if (numberIsInRange(mousePos.x, xSA - 5, xSA + 5) && numberIsInRange(mousePos.y, ySA + hSA - 5, ySA + hSA + 5)) {
            	canvas.style.cursor = 'sw-resize';	            	
            	if (mouseDownPos != null) {
            		currentActionFunc = resizeSelectionArea.bind(this, 'wh', 'bl');
            	}	
            } else if (numberIsInRange(mousePos.x, xSA + wSA - 5, xSA + wSA + 5) && numberIsInRange(mousePos.y, ySA - 5, ySA + 5)) {
            	canvas.style.cursor = 'sw-resize';	            	
            	if (mouseDownPos != null) {
            		currentActionFunc = resizeSelectionArea.bind(this, 'wh', 'tr');
        		}
        	}
        } else {
        	canvas.style.cursor = 'default';
        	return;
        }

        if (currentActionFunc != null) {
        	currentActionFunc.call();
        }
    }

    function numberIsInRange (number, min, max, inclusive = true) {
    	if (inclusive) {
    		return (number >= min && number <= max); 
    	}
    	return (number > min && number < max); 
    }

    function moveSelectionArea () {
    	var x = mouseDownPos.x - mousePos.x,
        y = mouseDownPos.y - mousePos.y;
        var offset = {
            'x': this.selectionArea.x - x,
            'y': this.selectionArea.y - y
        };  
        this.selectionArea.x = offset.x >= 0 ? (offset.x + this.selectionArea.width <= this.options.image.width ? offset.x : this.options.image.width - this.selectionArea.width) : 0;
        this.selectionArea.y = offset.y >= 0 ? (offset.y + this.selectionArea.height <= this.options.image.height ? offset.y : this.options.image.height - this.selectionArea.height) : 0;
        mouseDownPos.x = mousePos.x;
        mouseDownPos.y = mousePos.y;            
        drawImage.call(this);
    }

    function resizeSelectionArea (r, d) {
    	var auxSA = Object.assign({}, this.selectionArea);
        if (r == 'w') {
        	if (d == 'l') {
        		var aux = this.selectionArea.x;
        		this.selectionArea.x = mousePos.x;
        		this.selectionArea.width = this.selectionArea.width + (aux - mousePos.x);	
        	} else {
        		this.selectionArea.width = this.selectionArea.width - (mouseDownPos.x - mousePos.x);
        	}
        } else if (r == 'h') {
       		if (d == 't') {
        		var aux = this.selectionArea.y;
        		this.selectionArea.y = mousePos.y;
        		this.selectionArea.height = this.selectionArea.height + (aux - mousePos.y);	
        	} else {
        		this.selectionArea.height = this.selectionArea.height - (mouseDownPos.y - mousePos.y);
        	} 	
        } else if (r == 'wh') {
        	if (d == "tl") {
        		var auxX = this.selectionArea.x;
        		this.selectionArea.x = mousePos.x;
        		this.selectionArea.width = this.selectionArea.width + (auxX - mousePos.x);

        		var auxY = this.selectionArea.y;
        		this.selectionArea.y = mousePos.y;
        		this.selectionArea.height = this.selectionArea.height + (auxY - mousePos.y);
        	} else if (d == "br") {
        		this.selectionArea.width = this.selectionArea.width - (mouseDownPos.x - mousePos.x);
        		this.selectionArea.height = this.selectionArea.height - (mouseDownPos.y - mousePos.y);	
        	} else if (d == "bl") {
        		var auxX = this.selectionArea.x;
        		this.selectionArea.x = mousePos.x;
        		this.selectionArea.width = this.selectionArea.width + (auxX - mousePos.x);	

        		this.selectionArea.height = this.selectionArea.height - (mouseDownPos.y - mousePos.y);	

        	} else if (d == "tr") {
        		this.selectionArea.width = this.selectionArea.width - (mouseDownPos.x - mousePos.x);

        		var auxY = this.selectionArea.y;
        		this.selectionArea.y = mousePos.y;
        		this.selectionArea.height = this.selectionArea.height + (auxY - mousePos.y);	
        	}
        }

        if (this.options.aspectRatio != null) {
        	if (r == "w") {
        		this.selectionArea.height = (this.selectionArea.width * this.options.aspectRatio[1]) / this.options.aspectRatio[0];
        	} else if (r == "h") {
        		this.selectionArea.width = (this.selectionArea.height * this.options.aspectRatio[0]) / this.options.aspectRatio[1];
        	} else {
        		if (this.selectionArea.width < this.selectionArea.height) {
        			this.selectionArea.height = (this.selectionArea.width * this.options.aspectRatio[1]) / this.options.aspectRatio[0];	
        		} else {
        			this.selectionArea.width = (this.selectionArea.height * this.options.aspectRatio[0]) / this.options.aspectRatio[1];	
        		}
        	}
        }
        if ((this.selectionArea.x + this.selectionArea.width) > this.options.width || (this.selectionArea.y + this.selectionArea.height) > this.options.height) {
        	this.selectionArea = auxSA;
        }
        mouseDownPos.x = mousePos.x;
        mouseDownPos.y = mousePos.y;
        drawImage.call(this);
    }

	function margeJson (obj1, obj2) {
		var result = Object.create(obj1);
		for (var attr in obj2) {
			if (result[attr] !== undefined && obj2[attr] != null) {
				result[attr] = obj2[attr];
			}
		}
		return result;
	}

	function drawSelecctionArea () {
		context.setLineDash([5]);
        context.rect(this.selectionArea.x, this.selectionArea.y, this.selectionArea.width, this.selectionArea.height);
        context.stroke();	
	}

	function drawImage () {
		canvas.width = this.options.image.width;
		canvas.height = this.options.image.height;
		context.drawImage(this.options.image, 0, 0);
		drawSelecctionArea.call(this);
	}

	function newSize (f, t, o) {
		var p = (t * 100) / f;
		return (p * o) / 100;
	}

	function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
        	x: evt.clientX - rect.left,
          	y: evt.clientY - rect.top
    	};
    }

    function checkImageExtension(image) {
    	if (extensions.indexOf(image.split('.').pop()) == -1) {
			var message = "Image must be png or jpg";			
			throw message;
		}
		return true;
    }

	VCrop.prototype.crop = function () {
		var auxcanvas = document.createElement('canvas');
		var auxcontext = auxcanvas.getContext('2d');
		auxcanvas.width = this.selectionArea.width;
		auxcanvas.height = this.selectionArea.height;            
        auxcontext.drawImage(this.options.image, this.selectionArea.x, this.selectionArea.y, this.selectionArea.width
        	, this.selectionArea.height, 0, 0, this.selectionArea.width, this.selectionArea.height);
        return auxcanvas.toDataURL();
	}

	VCrop.prototype.setImage = function (file) {
		var url = "";
		if (typeof(file) == 'object' && file.name !== undefined) {
			checkImageExtension(file.name);			
			url = URL.createObjectURL(file)
		} else if (typeof(file) == 'string') {
			checkImageExtension(file);			
			url = file;
		} else {
			throw "Parameter is not either a file or a valid url";
		}
		var _this = this;
		this.options.image.src = url;
		this.options.image.onload = function () {
			var width = this.width;
			var height = this.height;
			if (this.width > _this.options.width || this.height > _this.options.height) {
				if (this.width > this.height) {
					width = _this.options.width;
					height = newSize(this.width, _this.options.width, this.height);
				} else {
					height = _this.options.height;
					width = newSize(this.height, _this.options.height, this.width);
				}
				var auxcanvas = document.createElement('canvas');
				var auxcontext = auxcanvas.getContext('2d');
				auxcanvas.width = width;
				auxcanvas.height = height;
				auxcontext.drawImage(this, 0, 0, width, height);
				_this.options.image.src = auxcanvas.toDataURL();
				return;
			}
			_this.options.width = width;
			_this.options.height = height;

			drawImage.call(_this);
			canvas.addEventListener('mousemove', mouseMove.bind(_this));
			canvas.addEventListener('mousedown', mouseDown.bind(this), false);
			canvas.addEventListener('mouseup', mouseUp.bind(this), false);
		};
		this.options.image.onerror = function (error) {
			console.error('An error ocurre while loading the image', error);
		};
	}

	return VCrop;
})();