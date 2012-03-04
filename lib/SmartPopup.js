/* Copyright (c) by PRODEVELOP SL
 * Coded by Javi Carrasco jacarma@gmail.com
 * Published under the Clear BSD license.  
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

function SmartPopup( map){
	
	this.map = map;
	this.layers=[];
	
	var thisPopup = this;
	this.selectControl = new OpenLayers.Control.SelectFeature([],{
		onSelect: function(feature){thisPopup.onFeatureSelect(feature)}, 
		onUnselect: thisPopup.onFeatureUnselect
	});
	map.addControl(	this.selectControl );
	this.selectControl.activate();
	
	map.events.on({"zoomend":function(){thisPopup.onZoomEnd()}});
}

SmartPopup.prototype.addLayer = function (templateId,layer) {
	layer.templateId=templateId;
	layer.template = document.getElementById(templateId).innerHTML;
	
	this.layers.push(layer);
	
	this.selectControl.setLayer(this.layers);
	
}

SmartPopup.prototype.onFeatureSelect = function (feature) {
	var selectedFeature = feature;
	this.onFeatureUnselect(feature);
	SmartPopup.popup = new OpenLayers.Popup.FramedCloud(null, 
		 selectedFeature.geometry.getBounds().getCenterLonLat(),
		 null,
		 selectedFeature.layer.template.replace(/%([^%]*)%/g, 
			function(a,b,c,d){ return (selectedFeature.attributes[b])}),
		null, false, null);
	SmartPopup.popup.maxSize=new OpenLayers.Size(300,500);
	this.map.addPopup(SmartPopup.popup);
}

SmartPopup.prototype.onFeatureUnselect = function(feature) {
	if (SmartPopup.popup){
		feature.layer.map.removePopup(SmartPopup.popup);
		SmartPopup.popup.destroy();
		SmartPopup.popup = null;
	}
}

SmartPopup.prototype.onZoomEnd = function () {
	if (SmartPopup.popup){
		this.map.removePopup(SmartPopup.popup);
		SmartPopup.popup.destroy();
		SmartPopup.popup = null;
	}
}


SmartPopup.popup = null;