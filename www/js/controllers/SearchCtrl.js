angular.module('gssearch.controllers')
  .controller("SearchCtrl", function($scope, $ionicListDelegate, $http, $ionicPopup, GSSearchShareState, GSSearchDataStore){
	$scope.searchForm={};
	$scope.searchedEntries = GSSearchShareState.retrieveAll();
	$scope.add=true;

    $scope.errorAlert=false;
    $scope.lastCheck = new Date().getTime() / 1000;
	$scope.search = function (searchMore) {
		var currentSeconds = new Date().getTime() ;
		if (  (currentSeconds - $scope.lastCheck) < 500 && !searchMore ) {
			return;
		}
		$scope.lastCheck = currentSeconds;
		$scope.errorAlert=false;

		//https://maps.googleapis.com/maps/api/js?libraries=places&callback=initAutocomplete
		//https://maps.googleapis.com/maps/api/geocode/json?address=goli+vada&components=country
		//https://maps.googleapis.com/maps/api/place/textsearch/json?query=goli+vada+pav+bangalore&key=ky
        $scope.searchedEntries.length=0;

        var splits = $scope.searchForm.searchFor.split(",");
        // If two value and number then its possibly a lng and lat
		if ( splits && splits.length == 2 ) {
			var sLat = splits[0];
			var sLng = splits[1];
			if ( !isNaN(sLat) &&  !isNaN(sLng) ) {
				GSSearchShareState.addLocation(
						{   "id" : "LOCATION_THIS_"+new Date().valueOf(),
							"place" : "Latitute,Longitude?",
							"display_name": "Latitute,Longitude?",
							"formatted_address" : "Latitude/Longitude : "+sLat+" @ "+sLng,
							"display_address" : "Latitude/Longitude : "+sLat+" @ "+sLng,
							"latitude"  : sLat,
							"longitude" : sLng}
					);
			}
		}


		$http.get( 'https://maps.googleapis.com/maps/api/geocode/json',
				   {params:{"address": $scope.searchForm.searchFor}})
		     .then(function(resp){
				var result = resp.data;
				//console.log(resp);
				if ( result.status == "OK" ) {
					angular.forEach(result.results, function(entry,i){
						var plc = (entry.address_components[0]||{"long_name":searchForm.searchFor}).long_name;
						$scope.searchedEntries =
						GSSearchShareState.addLocation(
						           {"place":plc,
						            "display_name":plc,
						            "formatted_address":entry.formatted_address,
						            "display_address":entry.formatted_address,
						            "latitude":entry.geometry.location.lat,
						            "longitude":entry.geometry.location.lng
						           },{"isAddress":true, "idPrefix":i});
					});
				}
			 },
			  function(data, status, headers, config){
				  //$scope.showAlert(data.statusText);
				  $scope.errorAlert=true;
			  });

        if ( searchMore ) {
			var errorMsg="";
			var executionCounter=0;
			var appConfig = angular.copy(GSSearchDataStore.getConfig());
			var apiKeys= (appConfig.apikeys || []).reverse();;
			var executionCounterLimit=apiKeys.length;
			if ( executionCounterLimit ) {
				moreSearchFn(apiKeys);
			}

			function moreSearchFn(remainingApiKeys) {
				remainingApiKeys = remainingApiKeys || [];
				if ( remainingApiKeys.length == 0 ){
					return;
				}
				executionCounter++;
				var apikey=remainingApiKeys.splice(0,1);
				$http.get( 'https://maps.googleapis.com/maps/api/place/textsearch/json',
						   {params:
							 {"query": $scope.searchForm.searchFor,
							  "key": apikey,
							  "types": "accounting|airport|amusement_park|aquarium|art_gallery|atm|bakery|bank|bar|beauty_salon|bicycle_store|book_store|bowling_alley|bus_station|cafe|campground|car_dealer|car_rental|car_repair|car_wash|casino|cemetery|church|city_hall|clothing_store|convenience_store|courthouse|dentist|department_store|doctor|electrician|electronics_store|embassy|establishment|finance|fire_station|florist|food|funeral_home|furniture_store|gas_station|general_contractor|grocery_or_supermarket|gym|hair_care|hardware_store|health|hindu_temple|home_goods_store|hospital|insurance_agency|jewelry_store|laundry|lawyer|library|liquor_store|local_government_office|locksmith|lodging|meal_delivery|meal_takeaway|mosque|movie_rental|movie_theater|moving_company|museum|night_club|painter|park|parking|pet_store|pharmacy|physiotherapist|place_of_worship|plumber|police|post_office|real_estate_agency|restaurant|roofing_contractor|rv_park|school|shoe_store|shopping_mall|spa|stadium|storage|store|subway_station|synagogue|taxi_stand|train_station|travel_agency|university|veterinary_care|zoo|administrative_area_level_1|administrative_area_level_2|administrative_area_level_3|administrative_area_level_4|administrative_area_level_5|colloquial_area|country|floor|geocode|intersection|locality|natural_feature|neighborhood|political|point_of_interest|post_box|postal_code|postal_code_prefix|postal_code_suffix|postal_town|premise|room|route|street_address|street_number|sublocality|sublocality_level_4|sublocality_level_5|sublocality_level_3|sublocality_level_2|sublocality_level_1|subpremise|transit_station"
							 }
							})
					 .then(function(resp){
						var result = resp.data;
						if ( result.status == "OK" ) {
							angular.forEach(result.results, function(entry,i){
								var plc = entry.name||searchForm.searchFor;
								$scope.searchedEntries =
								GSSearchShareState.addLocation(
										   {"place":plc,
											"display_name":plc,
											"formatted_address":entry.formatted_address,
											"display_address":entry.formatted_address,
											"latitude":entry.geometry.location.lat,
											"longitude":entry.geometry.location.lng
											},{"isPlace":true, "idPrefix":i});
							});
						} else {
							if (result.status=="REQUEST_DENIED" && appConfig.onSearchRemoveInvalidAPIKeys == true) {
								GSSearchDataStore.removeAPIKey(apikey);
								errorMsg +="API Key : "+ apikey + " - REMOVED! <br>";
							} else {
							  errorMsg +="API Key : "+ apikey + " - " + result.status + " : " + (result.error_message||"")+"<br>";
							}
							if(remainingApiKeys.length == 0) {
							  $scope.showAlert(errorMsg);
						    } else {
								// Max try only for num keys
								if ( executionCounter < executionCounterLimit ) {
								  moreSearchFn(remainingApiKeys);
							    }
							}
						}
					 },
					  function(data, status, headers, config){
						  //$scope.showAlert(data.statusText);
						  $scope.errorAlert=true;
					  }
					 );
			}
		}


	};

    $scope.add = function(entryId) {
		$ionicListDelegate.closeOptionButtons();
		var thisEntry = GSSearchShareState.searchLocationById(entryId);
		if ( thisEntry ) {
            thisEntry.formatted_address = GSSearchDataStore.maskAddress(thisEntry.display_name,
              thisEntry.formatted_address, thisEntry.latitude, thisEntry.longitude);
		    GSSearchShareState.addToStore(entryId);
		}

	};

    $scope.clear = function(entryId) {
		$scope.searchForm.searchFor = "";
		$scope.searchedEntries.length=0;
		GSSearchShareState.setSearchList($scope.searchedEntries);
	};

    $scope.openSygic = function(lat, lng) {
		$ionicListDelegate.closeOptionButtons();
		GSSearchDataStore.openSygic(lat, lng);
	}


	 // An alert dialog
	 $scope.showAlert = function(msg) {
	   var alertPopup = $ionicPopup.alert({
		 title: 'Error',
		 template: msg
	   });
	   alertPopup.then(function(res) {
	   });
	 };

  });
