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
 * Class: OpenLayers.Layer.Social.Flickr
 * 
 * Inherits from:
 *  - <OpenLayers.Layer.Vector>
 */
OpenLayers.Layer.Social.Flickr = OpenLayers.Class(
  OpenLayers.Layer.Vector, {
	
    /**
     * Constructor: OpenLayers.Layer.Social.Flickr
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
		if (!(newArguments[1].styleMap)){
			newArguments[1].styleMap = new OpenLayers.StyleMap({
				pointRadius: 16,
				externalGraphic: '${url_t}'
			});
		}
		
		newArguments[1].protocol = new OpenLayers.Protocol.Script2({
			url: "http://api.flickr.com/services/rest/",
			callbackKey: "jsoncallback",
			params:{ 
				method: "flickr.photos.search",
				api_key: apikey,
				format: "json",
				extras: "geo,url_t,owner_name,url_m",
				min_upload_date : "1157285524.213"
			},
			filterToParams: function(filter, params) {
				if (filter.type === OpenLayers.Filter.Spatial.BBOX) {
					params.bbox = ""+
						Math.max(filter.value.left,-180) + "," +
						Math.max(filter.value.bottom,-90) + "," +
						Math.min(filter.value.right,180) + "," +
						Math.min(filter.value.top,90);
				}
				return params;
			},
			format: new OpenLayers.Format.FlatJSON({
				getResultArray : function(obj){ return obj.photos.photo},
				getLat : function(obj) { return obj.latitude },
				getLon : function(obj) { return obj.longitude }
			})
		});
		
        OpenLayers.Layer.Vector.prototype.initialize.apply(this, newArguments);
    },    

    CLASS_NAME: "OpenLayers.Layer.Social.Flickr"
});
