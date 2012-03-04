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
 * Class: OpenLayers.Layer.Social.Yelp
 * 
 * Inherits from:
 *  - <OpenLayers.Layer.Vector>
 */
OpenLayers.Layer.Social.Yelp = OpenLayers.Class(
  OpenLayers.Layer.Vector, {
	
    /**
     * Constructor: OpenLayers.Layer.Social.Yelp
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
			url: "http://api.yelp.com/business_review_search",
			params: {
				ywsid: apikey,
				limit: "20"
			},
			callbackKey: "callback",
			filterToParams: function(filter, params) {
				if (filter.type === OpenLayers.Filter.Spatial.BBOX) {
					params.tl_lat=filter.value.top;
					params.tl_long=filter.value.left;
					params.br_lat=filter.value.bottom;
					params.br_long=filter.value.right;
				}
				return params;
			},
			format: new OpenLayers.Format.FlatJSON({
				getResultArray : function(obj){ return obj.businesses},
				getLat : function(obj) { return obj.latitude },
				getLon : function(obj) { return obj.longitude }
			})
		});
		
        OpenLayers.Layer.Vector.prototype.initialize.apply(this, newArguments);
    },    

    CLASS_NAME: "OpenLayers.Layer.Social.Yelp"
});
