/* Copyright (c) by PRODEVELOP SL
 * Coded by Javi Carrasco jacarma@gmail.com
 * Published under the Clear BSD license.  
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */


/**
 * @requires OpenLayers/Layer/Vector.js
 * @requires OpenLayers/Console.js
 * @requires OpenLayers/Lang.js
 * @requires OpenLayers/Format/FlatJSON.js
 * @requires OpenLayers/Protocol/Script2.js
 */

/**
 * Class: OpenLayers.Layer.Social.POIProxy
 * 
 * Inherits from:
 *  - <OpenLayers.Layer.Vector>
 */
OpenLayers.Layer.Social.POIProxy = OpenLayers.Class(
  OpenLayers.Layer.Vector, {
	
    /**
     * Constructor: OpenLayers.Layer.Social.POIProxy
     *
     * Parameters:
     * name - {String} 
     * options - {Object} Hashtable of extra options to tag onto the layer
     */
    initialize: function(name, service, options) {
        if (options == undefined) { options = {}; } 
        
        var newArguments = [];
        newArguments.push(name, options);
		
		if (!(newArguments[1].strategies)){
			  newArguments[1].strategies = [
				new OpenLayers.Strategy.BBOX({resFactor:2})
			];
		}
		
		newArguments[1].protocol = new OpenLayers.Protocol.Script2({
			url: "http://poiproxy.mapps.es/browseByExtent",
			params: {
				service: service
			},
			callbackKey: "callback",
			filterToParams: function(filter, params) {
				if (filter.type === OpenLayers.Filter.Spatial.BBOX) {
					params.minX = Math.max(filter.value.left,-180);
					params.minY = Math.max(filter.value.bottom,-90);
					params.maxX = Math.min(filter.value.right,180);
					params.maxY = Math.min(filter.value.top,90);
				}
				return params;
			},
			format: new OpenLayers.Format.GeoJSON()
		});
		
        OpenLayers.Layer.Vector.prototype.initialize.apply(this, newArguments);
    },    

    CLASS_NAME: "OpenLayers.Layer.Social.POIProxy"
});
