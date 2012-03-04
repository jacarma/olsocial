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
 * Class: OpenLayers.Layer.Social.Lastfm
 * 
 * Inherits from:
 *  - <OpenLayers.Layer.Vector>
 */
OpenLayers.Layer.Social.Lastfm = OpenLayers.Class(
  OpenLayers.Layer.Vector, {
	
    /**
     * Constructor: OpenLayers.Layer.Social.Lastfm
     *
     * Parameters:
     * name - {String} 
     * options - {Object} Hashtable of extra options to tag onto the layer
     */
    initialize: function(name, apikey, options) {
        if (options == undefined) { options = {}; } 
        
        var newArguments = [];
        newArguments.push(name, options);
		
		if (!(newArguments[1].strategies)){
			  newArguments[1].strategies = [
				new OpenLayers.Strategy.BBOX({resFactor:2})
			];
		}
		
		newArguments[1].protocol = new OpenLayers.Protocol.Script2({
			url: "http://ws.audioscrobbler.com/2.0/",
			params: {
				method: "geo.getevents",
				api_key: apikey,
				limit: "50",
				format: "json"
			},
			callbackKey: "callback",
			filterToParams: function(filter, params) {
				if (filter.type === OpenLayers.Filter.Spatial.BBOX) {
					var dist = OpenLayers.Util.distVincenty(
						filter.value.getCenterLonLat(), 
						{lon: filter.value.left, lat: filter.value.bottom}
					);
					params.lat=filter.value.getCenterLonLat().lat;
					params.long=filter.value.getCenterLonLat().lon;
					params.distance=Math.min(dist,1000);
				}
				return params;
			},
			format: new OpenLayers.Format.FlatJSON({
				getResultArray : function(obj){ return obj.events.event},
				getLat : function(obj) { return obj.venue.location["geo:point"]["geo:lat"] },
				getLon : function(obj) { return obj.venue.location["geo:point"]["geo:long"] }
			})
		});
		
        OpenLayers.Layer.Vector.prototype.initialize.apply(this, newArguments);
    },    

    CLASS_NAME: "OpenLayers.Layer.Social.Lastfm"
});
