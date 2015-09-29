(function(){

  angular.module('gssearch.services').
  factory('GSSearchDataStore',function(){

    function persist() {
    	window.localStorage["gssearch"] = angular.toJson(appData);
	}

	var DefaultSygicURLScheme = 'com.sygic.aura://coordinate|:lng:|:lat:|drive';


	var appData = angular.fromJson(window.localStorage["gssearch"]||"{}");
	appData.savedLocations = appData.savedLocations || [];
    appData.configData = appData.configData || { "staticMapConfig": { "zoomMin": 3, "zoomMax": 20, "imageHeight": 320, "imageWidth": 240, "defaultZoomSize": 12} };
    appData.configData.onSearchRemoveInvalidAPIKeys = appData.configData.onSearchRemoveInvalidAPIKeys || false;
    appData.configData.apikeys=appData.configData.apikeys||[];
    appData.configData.sygicURLScheme= (appData.configData.sygicURLScheme && appData.configData.sygicURLScheme != "" ) ? appData.configData.sygicURLScheme : DefaultSygicURLScheme;
    appData.configData.gps = appData.configData.gps || {};
    appData.configData.gps.enableHighAccuracy = appData.configData.gps.enableHighAccuracy || false;
    appData.configData.gps.timeout = appData.configData.gps.timeout || 120000;
    appData.configData.saveOrigAddress = false; // As google does not permit to store original address. (For testing can be switched to true)
    persist();

    return {

		getConfig : function () {
			return appData.configData;
		},

		getDefaultSygicURLScheme: function() {
			return DefaultSygicURLScheme;
		},

		retrieveAll : function () {
			return appData.savedLocations;
		},

		searchLocationById : function ( entryId ) {
			var numOfSavedLocations = appData.savedLocations.length;
			for(var i=0; i < numOfSavedLocations; i++) {
				if ( appData.savedLocations[i].id == entryId ) {
					return appData.savedLocations[i];
				}
			}
			return undefined;
		},

		searchLocationByPosition : function ( lat, lng ) {
			var numOfSavedLocations = appData.savedLocations.length;
			for(var i=0; i < numOfSavedLocations; i++) {
				if ( appData.savedLocations[i].latitude == lat && appData.savedLocations[i].longitude == lng ) {
					return i;
				}
			}
			return undefined;
		},

		remove : function ( entryId ) {
			var numOfSavedLocations = appData.savedLocations.length;
			var whichRemoved = undefined;
			for(var i=0; i < numOfSavedLocations; i++) {
				if ( appData.savedLocations[i].id == entryId ) {
					whichRemoved =  appData.savedLocations.splice(i,1);
				}
			}
			persist();
			return whichRemoved;
		},

		move : function ( entry, fromIndex, toIndex ) {
			appData.savedLocations.splice(fromIndex, 1);
			appData.savedLocations.splice(toIndex, 0, entry);
			persist();
		},

		addLocation : function ( place, display_name, formatted_address, latitude, longitude) {
			if ( display_name == "" ) {
				display_name = place;
			}
			var locIndex = this.searchLocationByPosition(latitude, longitude);
			if ( locIndex !== undefined ) {
				appData.savedLocations[locIndex].display_name = display_name;
				//Move to top
				if ( locIndex > 0 ) {
					this.move(appData.savedLocations[locIndex], locIndex, 0);
				}
			} else {
                var prefix = appData.savedLocations.length||0;
				appData.savedLocations.splice(0, 0,
					  {
						"id" : "LOCATION_"+prefix+"_"+new Date().valueOf(),
						"place" : place,
						"display_name": display_name,
						"formatted_address" : formatted_address,
						"latitude" : latitude,
						"longitude" : longitude} );
			}
            //console.log("-->",appData);
			persist();
		},

		addToStore : function ( entryId ) {
			var entry = this.searchLocationById(entryId);
			if ( entry ) {
				this.addLocation(entry.place, entry.display_name, entry.formatted_address, entry.latitude, entry.longitude);
			}
		},

		saveSettings : function ( settings ) {
			appData.configData.apikeys = settings.apikeys;
			appData.configData.onSearchRemoveInvalidAPIKeys = settings.onSearchRemoveInvalidAPIKeys;
			appData.configData.sygicURLScheme= ( settings.sygicURLScheme && settings.sygicURLScheme != "") ? settings.sygicURLScheme : DefaultSygicURLScheme;
			appData.configData.gps= settings.gps;
			persist();
		},

		removeAPIKey : function ( apikey ) {
			var apikeys=appData.configData.apikeys||[];
			for(var i=0; i<apikeys.length; i++) {
				if( apikeys[i] == apikey ) {
					appData.configData.apikeys.splice(i,1);
				};
			}
			persist();
		},

		getStaticMapURL : function(lat, lng) {
	      var staticMapConfig = appData.configData.staticMapConfig;
		  return  "http://maps.google.com/maps/api/staticmap?markers=color:blue|label:o|" + lat + "," + lng
		        + "&zoom=" + staticMapConfig.defaultZoomSize
		        + "&size=" + staticMapConfig.imageWidth + "x" + staticMapConfig.imageHeight + "&scale=4";
	    },

		maskAddress : function(display_name, formatted_address, lat, lng) {
          if ( ! appData.configData.saveOrigAddress ) {
	        return display_name + " @ " + lat + " / " + lng;
		  }
		  return formatted_address;
		},



	    getSygicURL : function(lat, lng) {
			return appData.configData.sygicURLScheme.replace(":lat:",lat).replace(":lng:",lng);
		},

		openSygic : function(lat, lng) {
			var url=this.getSygicURL(lat, lng);
			//alert(url);
			window.open(url, '_system');
		},

		copyToClipboard : function (ngCordovaClipboard, entry) {
			//var value="https://www.google.com/maps/preview/@"+entry.latitude+","+entry.longitude+",8z";
			var value=entry.latitude+", "+entry.longitude;
			//var value="https://maps.google.com/?q="+entry.latitude+","+entry.longitude;
			//console.log(value);
			ngCordovaClipboard.copy(value).then(function() {
				//console.log("Copied text : "+value);
			}, function() {
				//console.error("There was an error copying :  " + value);
			});
		},

		shareLocation : function ($cordovaSocialSharing, entry) {
			// $cordovaSocialSharing.share(entry.latitude+", "+entry.longitude,
			//                             "Location sent from GSSearch (Lat,Lng) :  ",
			//                             null, // image file like www/ionic.png
			//                             "https://maps.google.com/?q="+entry.latitude+","+entry.longitude);

			$cordovaSocialSharing.share(entry.latitude+", "+entry.longitude);
		}
	};
  });
})();