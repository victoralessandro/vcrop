# vcrop
Crop imge using HTML5 canvas API

## Instalation

Copy the vCrop.min.js file and embed it into your html file.

```html
<script src="path_to_file/vCrop.min.js"></script>
```

## Usage

## Usage exmaple

```javascript
var crop = new VCrop({
    		'width': 500,
    		'height': 500,
    		'selector': {
    			'width': 200,
    			'height': 112.5
    		},
    		'container': document.body,
    		'resizable': true,
    		'aspectRatio': '16:9'
    	});
```

To crop the image call:

```javascript
crop.crop();
```

# License

GNU GENERAL PUBLIC LICENSE