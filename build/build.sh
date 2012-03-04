#!/bin/bash

cat ../lib/OpenLayers/Format/FlatJSON.js > olsocial.js
cat ../lib/OpenLayers/Protocol/Script2.js >> olsocial.js
cat ../lib/OpenLayers/Layer/Social.js >> olsocial.js
cat ../lib/OpenLayers/Layer/Social/Twitter.js >> olsocial.js
cat ../lib/OpenLayers/Layer/Social/Flickr.js >> olsocial.js
cat ../lib/OpenLayers/Layer/Social/POIProxy.js >> olsocial.js
cat ../lib/OpenLayers/Layer/Social/Lastfm.js >> olsocial.js
cat ../lib/OpenLayers/Layer/Social/Yelp.js >> olsocial.js
