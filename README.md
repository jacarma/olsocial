# Introduction

Olsocial provides OpenLayers.Layer implementations of several Social sites to use it inside OpenLayers easily.

[See the DEMO](http://jacarma.github.com/olsocial/demo.html).

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

# POIProxy

POIProxy is a service to retrieve Points of Interest from any public POI service such as Foursquare, 
Twitter, Buzz, Panoramio, Wikipedia, Flickr, etc... 
It provides a common interface to all those services so it's easy to display them in OpenLayers.
The complete list of services can be read here [POIProxy describeServices](http://poiproxy.mapps.es/describeServices).

# Popups

In the demo.html file I used my quick and dirty popup manager (SmartPopup.js) to display info 
balloons, using templates but I hardly recommend you to use the enhaced and brand 
new [OL-FeaturePopups](https://github.com/jorix/OL-FeaturePopups) control.

