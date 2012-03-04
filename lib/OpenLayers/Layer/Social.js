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
