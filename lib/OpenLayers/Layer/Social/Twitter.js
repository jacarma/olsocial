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
 * Class: OpenLayers.Layer.Social.Twitter
 * 
 * Inherits from:
 *  - <OpenLayers.Layer.Vector>
 */
OpenLayers.Layer.Social.Twitter = OpenLayers.Class(
  OpenLayers.Layer.Vector, {
	
    /**
     * Constructor: OpenLayers.Layer.Social.Twitter
     *
     * Parameters:
     * name - {String} 
     * options - {Object} Hashtable of extra options to tag onto the layer
     */
    initialize: function(name, options) {
        if (options == undefined) { options = {}; } 
        
        var newArguments = [];
        newArguments.push(name, options);
		
		if (!(newArguments[1].strategies)){
			  newArguments[1].strategies = [
				new OpenLayers.Strategy.BBOX({resFactor:2})
			];
		}
		
		newArguments[1].protocol = new OpenLayers.Protocol.Script2({
			url: "http://search.twitter.com/search.json",
			params: {
				rpp: "100"
			},
			callbackKey: "callback",
			filterToParams: function(filter, params) {
				if (filter.type === OpenLayers.Filter.Spatial.BBOX) {
					var dist = OpenLayers.Util.distVincenty(
						filter.value.getCenterLonLat(), 
						{lon: filter.value.left, lat: filter.value.bottom}
					);
					params.geocode=filter.value.getCenterLonLat().lat +
						"," + filter.value.getCenterLonLat().lon +
						"," + dist + "km";
				}
				return params;
			},
			format: new OpenLayers.Format.FlatJSON({
				getResultArray: function(obj){ return obj["results"]},
				getLat: function(obj){ 
					if (obj.geo && obj.geo.coordinates)
						return obj.geo.coordinates[0];
					var lat = obj.location.replace(/[^0-9\.\,]+/g,'').split(",")[0];
					return lat;
				},
				getLon: function(obj){ 
					if (obj.geo && obj.geo.coordinates)
						return obj.geo.coordinates[1];
					var lon = obj.location.replace(/[^0-9\.\,]+/g,'').split(",")[1];
					return lon;
				}
			})
		});
		
        OpenLayers.Layer.Vector.prototype.initialize.apply(this, newArguments);
    },    

    CLASS_NAME: "OpenLayers.Layer.Social.Twitter"
});
