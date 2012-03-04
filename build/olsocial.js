/* Copyright (c) 2006-2011 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the Clear BSD license.  
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

/**
 * @requires OpenLayers/Format/JSON.js
 * @requires OpenLayers/Feature/Vector.js
 * @requires OpenLayers/Geometry/Point.js
 * @requires OpenLayers/Geometry/MultiPoint.js
 * @requires OpenLayers/Geometry/LineString.js
 * @requires OpenLayers/Geometry/MultiLineString.js
 * @requires OpenLayers/Geometry/Polygon.js
 * @requires OpenLayers/Geometry/MultiPolygon.js
 * @requires OpenLayers/Console.js
 */

/**
 * Class: OpenLayers.Format.FlatJSON
 * Read JSON POI documents with no GeoJSON structure. 
 * Create a new parser with the
 *     <OpenLayers.Format.FlatJSON> constructor.
 *
 * Inherits from:
 *  - <OpenLayers.Format>
 */
OpenLayers.Format.FlatJSON = OpenLayers.Class(OpenLayers.Format, {

	/**
     * Method: getResultArray
     * Return the Array that cointains the items from
     *     the obj. Method to be overriden
     *
     * Parameters:
     * obj - {Object} An object created from a JSON document
     *
     * Returns:
     * <Object> An array of items.
     */
	getResultArray: function(obj){ return obj.results},
	
	/**
     * Method: getLat
     * Return the latitude value contained in the obj.
     *     Method to be overriden
     *
     * Parameters:
     * obj - {Object} An object item from a JSON object
     *
     * Returns:
     * A number
     */
    getLat: function(obj){ return obj.lat },
	/**
     * Method: getLon
     * Return the longitude value contained in the obj.
     *     Method to be overriden
     *
     * Parameters:
     * obj - {Object} An object item from a JSON object
     *
     * Returns:
     * A number
     */
	getLon: function(obj){ return obj.lon },

    read: function(json, type, filter) {
        var results = null;
        var obj = null;
        if (typeof json == "string") {
            obj = OpenLayers.Format.JSON.prototype.read.apply(this,
                                                              [json, filter]);
        } else { 
            obj = json;
        }    
        if(!obj) {
            OpenLayers.Console.error("Bad JSON: " + json);
			return;
        } 
		var res = this.getResultArray(obj);
		if (!res){
			OpenLayers.Console.error("Can't find the results Array : "+ json);
			return;
		}
		results = this.parseFeatures(res,this);
        return results;
    },
	
	parseFeatures: function(obj,format){
		var features = [];
		for (var i = 0; i< obj.length; i++){
			var feat = this.parseFeature(obj[i],format);
			if (feat) features.push(feat);
		}
		return features;
	},
    
    
    /**
     * Method: parseFeature
     * Convert an object item from a JSON into an
     *     <OpenLayers.Feature.Vector>.
     *
     * Parameters:
     * obj - {Object} An object created from a GeoJSON object
     *
     * Returns:
     * {<OpenLayers.Feature.Vector>} A feature.
     */
    parseFeature: function(obj,format) {
        var feature, geometry, attributes, bbox;
		attributes=new Object();
		for (att in obj){
			attributes[att]=obj[att];
		}
        
        try {
			var lat, lon;
			lat = format.getLat(obj);
			lon = format.getLon(obj);
			if (isNaN(parseFloat(lat)) || !isFinite(lat)) return;
			if (isNaN(parseFloat(lon)) || !isFinite(lon)) return;
            geometry = new OpenLayers.Geometry.Point(lon,lat);
        } catch(err) {
            // deal with bad geometries
            //throw err;
			return;
        }
		
		bbox = (geometry && geometry.bbox) || obj.bbox;
        
		feature = new OpenLayers.Feature.Vector(geometry, attributes);
        if(bbox) {
            feature.bounds = OpenLayers.Bounds.fromArray(bbox);
        }
        if(obj.id) {
            feature.fid = obj.id;
        }
        return feature;
    },
    

    CLASS_NAME: "OpenLayers.Format.FlatJSON" 

});     
/* Copyright (c) 2006-2011 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the Clear BSD license.  
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

/**
 * @requires OpenLayers/Protocol.js
 * @requires OpenLayers/Feature/Vector.js
 * @requires OpenLayers/Format/GeoJSON.js
 */

/**
 * Class: OpenLayers.Protocol.Script
 * A basic Script protocol for vector layers.  Create a new instance with the
 *     <OpenLayers.Protocol.Script> constructor.  A script protocol is used to
 *     get around the same origin policy.  It works with services that return
 *     JSONP - that is, JSON wrapped in a client-specified callback.  The
 *     protocol handles fetching and parsing of feature data and sends parsed
 *     features to the <callback> configured with the protocol.  The protocol
 *     expects features serialized as GeoJSON by default, but can be configured
 *     to work with other formats by setting the <format> property.
 *
 * Inherits from:
 *  - <OpenLayers.Protocol>
 */
OpenLayers.Protocol.Script2 = OpenLayers.Class(OpenLayers.Protocol, {

    /**
     * APIProperty: url
     * {String} Service URL.  The service is expected to return serialized 
     *     features wrapped in a named callback (where the callback name is
     *     generated by this protocol).
     *     Read-only, set through the options passed to the constructor.
     */
    url: null,

    /**
     * APIProperty: params
     * {Object} Query string parameters to be appended to the URL.
     *     Read-only, set through the options passed to the constructor.
     *     Example: {maxFeatures: 50}
     */
    params: null,
    
    /**
     * APIProperty: callback
     * {Object} Function to be called when the <read> operation completes.
     */
    callback: null,

    /**
     * APIProperty: scope
     * {Object} Optional ``this`` object for the callback. Read-only, set 
     *     through the options passed to the constructor.
     */
    scope: null,

    /**
     * APIProperty: format
     * {<OpenLayers.Format>} Format for parsing features.  Default is an 
     *     <OpenLayers.Format.GeoJSON> format.  If an alternative is provided,
     *     the format's read method must take an object and return an array
     *     of features.
     */
    format: null,

    /**
     * APIProperty: callbackKey
     * {String} The name of the query string parameter that the service 
     *     recognizes as the callback identifier.  Default is "callback".
     *     This key is used to generate the URL for the script.  For example
     *     setting <callbackKey> to "myCallback" would result in a URL like 
     *     http://example.com/?myCallback=...
     */
    callbackKey: "callback",

    /**
     * APIProperty: callbackPrefix
     * {String} Where a service requires that the callback query string 
     *     parameter value is prefixed by some string, this value may be set.
     *     For example, setting <callbackPrefix> to "foo:" would result in a
     *     URL like http://example.com/?callback=foo:...  Default is "".
     */
    callbackPrefix: "",

    /**
     * Property: pendingRequests
     * {Object} References all pending requests.  Property names are script 
     *     identifiers and property values are script elements.
     */
    pendingRequests: null,

    /**
     * APIProperty: srsInBBOX
     * {Boolean} Include the SRS identifier in BBOX query string parameter.
     *     Setting this property has no effect if a custom filterToParams method
     *     is provided.   Default is false.  If true and the layer has a 
     *     projection object set, any BBOX filter will be serialized with a 
     *     fifth item identifying the projection.  
     *     E.g. bbox=-1000,-1000,1000,1000,EPSG:900913
     */
    srsInBBOX: false,

    /**
     * Constructor: OpenLayers.Protocol.Script
     * A class for giving layers generic Script protocol.
     *
     * Parameters:
     * options - {Object} Optional object whose properties will be set on the
     *     instance.
     *
     * Valid options include:
     * url - {String}
     * params - {Object}
     * callback - {Function}
     * scope - {Object}
     */
    initialize: function(options) {
        options = options || {};
        this.params = {};
        this.pendingRequests = {};
        OpenLayers.Protocol.prototype.initialize.apply(this, arguments);
        if (!this.format) {
            this.format = new OpenLayers.Format.GeoJSON();
        }

        if (!this.filterToParams && OpenLayers.Format.QueryStringFilter) {
            var format = new OpenLayers.Format.QueryStringFilter({
                srsInBBOX: this.srsInBBOX
            });
            this.filterToParams = function(filter, params) {
                return format.write(filter, params);
            }
        }
    },
    
    /**
     * APIMethod: read
     * Construct a request for reading new features.
     *
     * Parameters:
     * options - {Object} Optional object for configuring the request.
     *     This object is modified and should not be reused.
     *
     * Valid options:
     * url - {String} Url for the request.
     * params - {Object} Parameters to get serialized as a query string.
     * filter - {<OpenLayers.Filter>} Filter to get serialized as a
     *     query string.
     *
     * Returns:
     * {<OpenLayers.Protocol.Response>} A response object, whose "priv" property
     *     references the injected script.  This object is also passed to the
     *     callback function when the request completes, its "features" property
     *     is then populated with the features received from the server.
     */
    read: function(options) {
        OpenLayers.Protocol.prototype.read.apply(this, arguments);
        options = OpenLayers.Util.applyDefaults(options, this.options);
        options.params = OpenLayers.Util.applyDefaults(
            options.params, this.options.params
        );
        if (options.filter && this.filterToParams) {
            options.params = this.filterToParams(
                options.filter, options.params
            );
        }
        var response = new OpenLayers.Protocol.Response({requestType: "read"});
        var request = this.createRequest(
            options.url, 
            options.params, 
            OpenLayers.Function.bind(function(data) {
                response.data = data;
                this.handleRead(response, options);
            }, this)
        );
        response.priv = request;
        return response;
    },

    /** 
     * APIMethod: filterToParams 
     * Optional method to translate an <OpenLayers.Filter> object into an object 
     *     that can be serialized as request query string provided.  If a custom 
     *     method is not provided, any filter will not be serialized. 
     * 
     * Parameters: 
     * filter - {<OpenLayers.Filter>} filter to convert. 
     * params - {Object} The parameters object. 
     * 
     * Returns: 
     * {Object} The resulting parameters object. 
     */

    /** 
     * Method: createRequest
     * Issues a request for features by creating injecting a script in the 
     *     document head.
     *
     * Parameters:
     * url - {String} Service URL.
     * params - {Object} Query string parameters.
     * callback - {Function} Callback to be called with resulting data.
     *
     * Returns:
     * {HTMLScriptElement} The script pending execution.
     */
    createRequest: function(url, params, callback) {
        var id = OpenLayers.Protocol.Script.register(callback);
        var name = "OpenLayers.Protocol.Script.registry.regId" + id 
        params = OpenLayers.Util.extend({}, params);
        params[this.callbackKey] = this.callbackPrefix + name;
        url = OpenLayers.Util.urlAppend(
            url, OpenLayers.Util.getParameterString(params)
        );
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = url;
        script.id = "OpenLayers_Protocol_Script_" + id;
        this.pendingRequests[script.id] = script;
        var head = document.getElementsByTagName("head")[0];
        head.appendChild(script);
        return script;
    },
    
    /** 
     * Method: destroyRequest
     * Remove a script node associated with a response from the document.  Also
     *     unregisters the callback and removes the script from the 
     *     <pendingRequests> object.
     *
     * Parameters:
     * script - {HTMLScriptElement}
     */
    destroyRequest: function(script) {
        OpenLayers.Protocol.Script.unregister(script.id.split("_").pop());
        delete this.pendingRequests[script.id];
        if (script.parentNode) {
            script.parentNode.removeChild(script);
        }
    },

    /**
     * Method: handleRead
     * Individual callbacks are created for read, create and update, should
     *     a subclass need to override each one separately.
     *
     * Parameters:
     * response - {<OpenLayers.Protocol.Response>} The response object to pass to
     *     the user callback.
     * options - {Object} The user options passed to the read call.
     */
    handleRead: function(response, options) {
        this.handleResponse(response, options);
    },

    /**
     * Method: handleResponse
     * Called by CRUD specific handlers.
     *
     * Parameters:
     * response - {<OpenLayers.Protocol.Response>} The response object to pass to
     *     any user callback.
     * options - {Object} The user options passed to the create, read, update,
     *     or delete call.
     */
    handleResponse: function(response, options) {
        if (options.callback) {
            if (response.data) {
                response.features = this.parseFeatures(response.data);
                response.code = OpenLayers.Protocol.Response.SUCCESS;
            } else {
                response.code = OpenLayers.Protocol.Response.FAILURE;
            }
            this.destroyRequest(response.priv);
            options.callback.call(options.scope, response);
        }
    },

    /**
     * Method: parseFeatures
     * Read Script response body and return features.
     *
     * Parameters:
     * data - {Object} The data sent to the callback function by the server.
     *
     * Returns:
     * {Array({<OpenLayers.Feature.Vector>})} or
     *     {<OpenLayers.Feature.Vector>} Array of features or a single feature.
     */
    parseFeatures: function(data) {
        return this.format.read(data);		
    },

    /**
     * APIMethod: abort
     * Abort an ongoing request.  If no response is provided, all pending 
     *     requests will be aborted.
     *
     * Parameters:
     * response - {<OpenLayers.Protocol.Response>} The response object returned
     *     from a <read> request.
     */
    abort: function(response) {
        if (response) {
            this.destroyRequest(response.priv);
        } else {
            for (var key in this.pendingRequests) {
                this.destroyRequest(this.pendingRequests[key]);
            }
        }
    },
    
    /**
     * APIMethod: destroy
     * Clean up the protocol.
     */
    destroy: function() {
        this.abort();
        delete this.params;
        delete this.format;
        OpenLayers.Protocol.prototype.destroy.apply(this);
    },

    CLASS_NAME: "OpenLayers.Protocol.Script2" 
});

(function() {
    var o = OpenLayers.Protocol.Script;
    var counter = 0;
    o.registry = {};
    
    /**
     * Function: OpenLayers.Protocol.Script.register
     * Register a callback for a newly created script.
     *
     * Parameters:
     * callback: {Function} The callback to be executed when the newly added
     *     script loads.  This callback will be called with a single argument
     *     that is the JSON returned by the service.
     *
     * Returns:
     * {Number} An identifier for retreiving the registered callback.
     */
    o.register = function(callback) {
        var id = ++counter;
        o.registry["regId" + id] = function() {
            o.unregister(id);
            callback.apply(this, arguments);
        };
        return id;
    };
    
    /**
     * Function: OpenLayers.Protocol.Script.unregister
     * Unregister a callback previously registered with the register function.
     *
     * Parameters:
     * id: {Number} The identifer returned by the register function.
     */
    o.unregister = function(id) {
        delete o.registry["regId" + id];
    };
})();
/* Copyright (c) 2006-2011 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the Clear BSD license.  
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
 * Class: OpenLayers.Layer.Social
 * 
 * Inherits from:
 *  - <OpenLayers.Layer.Vector>
 */
OpenLayers.Layer.Social = OpenLayers.Class(
  OpenLayers.Layer.Vector, {

    /**
     * APIProperty: isBaseLayer
     * {Boolean} Social layer is not a base layer by default. 
     */
    isBaseLayer: false,
   
    projection: new OpenLayers.Projection("EPSG:4326"),
	
    CLASS_NAME: "OpenLayers.Layer.Social"
});
/* Copyright (c) 2006-2011 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the Clear BSD license.  
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
/* Copyright (c) 2006-2011 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the Clear BSD license.  
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
/* Copyright (c) 2006-2011 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the Clear BSD license.  
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
/* Copyright (c) 2006-2011 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the Clear BSD license.  
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
/* Copyright (c) 2006-2011 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the Clear BSD license.  
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
