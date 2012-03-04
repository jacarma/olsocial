# Introduction

Olsocial provides OpenLayers.Layer implementations of several Social sites to use it inside OpenLayers easily.

Currently supported sites are:

* Flickr
* Twitter
* Lastfm
* Yelp
* POIProxy (panoramio, wikipedia, foursquare, and a lot more)

# Usage

OpenLayers.Layer.Social.* layers are standard vector layers, so you can set your own symbolizers and functionality.

To load a Twitter layer and display it using a twitter icon:

```javascipt
var layer1 = new OpenLayers.Layer.Social.Twitter("Twitter",{
			styleMap: new OpenLayers.StyleMap({
				externalGraphic: 'img/twitter_fugue.png',
				pointRadius: 8
			})
		});
map.addLayer(layer1);
```

The complete list of constructors is:

```javascript
new OpenLayers.Layer.Social.Twitter (layername, parameters);
new OpenLayers.Layer.Social.Flickr  (layername, apiKey, parameters);
new OpenLayers.Layer.Social.Lastfm  (layername, apiKey, parameters);
new OpenLayers.Layer.Social.Yelp    (layername, apiKey, parameters);
new OpenLayers.Layer.Social.POIProxy(layername, POIProxy_Layername, parameters);
```

Where parameters is the optional object with properties to set on the layers of any OpenLayers.Layer.Vector [see OpenLayers documentation](http://dev.openlayers.org/releases/OpenLayers-2.10/doc/apidocs/files/OpenLayers/Layer/Vector-js.html#OpenLayers.Layer.Vector.OpenLayers.Layer.Vector)
