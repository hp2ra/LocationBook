angular.module('gssearch.controllers')
  .controller("SettingsCtrl", function($scope, $ionicPopup, $ionicLoading, $state, GSSearchDataStore, GSSearchLocationService){

	var init = function () {
		$scope.appConfig = angular.copy(GSSearchDataStore.getConfig());
		$scope.appConfig.apikeys = $scope.appConfig.apikeys || [];
		$scope.appConfig.onSearchRemoveInvalidAPIKeys = $scope.appConfig.onSearchRemoveInvalidAPIKeys || false;
		$scope.appConfig.sygicURLScheme = $scope.appConfig.sygicURLScheme || GSSearchDataStore.getDefaultSygicURLScheme();
		$scope.appConfig.gps.timeout = $scope.appConfig.gps.timeout || 120;
		$scope.appConfig.gps.interval = $scope.appConfig.gps.interval || 5;
		$scope.appConfig.gps.accuracy = $scope.appConfig.gps.accuracy || 25;
		$scope.appConfig.gps.enableHighAccuracy = $scope.appConfig.gps.enableHighAccuracy || false;
		$scope.appConfig.newAPIKey="";
		$scope.settingsIsDirty=false;
		$scope.reordering=false;
	}

    init();

    $scope.addAPIKey = function(newAPIKey) {
		var apikeys=$scope.appConfig.apikeys;
		for(var i=0; i<apikeys.length; i++) {
			if( apikeys[i] == newAPIKey ) return;
		}
		apikeys.splice(0, 0, newAPIKey);
		$scope.settingsIsDirty=true;
	}

	$scope.sygicURLSchemeChange = function() {
		$scope.settingsIsDirty=true;
	};


    $scope.flagsChange = function( flags) {
		if ( flags.onSearchRemoveInvalidAPIKeys !== undefined) {
			$scope.settingsIsDirty=true;
		}
		if ( flags.gps_enableHighAccuracy !== undefined) {
			$scope.settingsIsDirty=true;
		}
		if ( flags.gps_timeout !== undefined) {
			$scope.settingsIsDirty=true;
		}
		if ( flags.gps_accuracy !== undefined) {
			$scope.settingsIsDirty=true;
		}
		if ( flags.gps_interval !== undefined) {
			$scope.settingsIsDirty=true;
		}
	}

	$scope.toggleReorder = function () {
		$scope.reordering=!$scope.reordering;
	}

	$scope.move = function ( apikey, fromIndex, toIndex ) {
		$scope.appConfig.apikeys.splice(fromIndex, 1);
	    $scope.appConfig.apikeys.splice(toIndex, 0, apikey);
		$scope.settingsIsDirty=true;
	}

	$scope.remove = function ( apikey ) {
		var apikeys=$scope.appConfig.apikeys;
		for(var i=0; i<apikeys.length; i++) {
			if( apikeys[i] == apikey ) {
				$scope.appConfig.apikeys.splice(i,1);
				$scope.settingsIsDirty=true;
				return;
			};
		}
	}

	$scope.saveSettings = function ( ) {
		// Copy over settings present in display
		GSSearchDataStore.saveSettings( {apikeys:$scope.appConfig.apikeys,
		            onSearchRemoveInvalidAPIKeys:$scope.appConfig.onSearchRemoveInvalidAPIKeys,
		                          sygicURLScheme:$scope.appConfig.sygicURLScheme,
		                                     gps:{enableHighAccuracy:$scope.appConfig.gps.enableHighAccuracy,
		                                                    accuracy:$scope.appConfig.gps.accuracy,
		                                                     timeout:$scope.appConfig.gps.timeout,
		                                                    interval:$scope.appConfig.gps.interval}
		            } );
		init();
	}

	$scope.cancelSettings = function ( ) {
		init();
	}

	// An alert dialog
	$scope.showAlert = function(msg) {
	  var alertPopup = $ionicPopup.alert({
		 title: 'Alert!',
		 template: msg
	  });
	  alertPopup.then(function(res) {
	  });
	};

	$scope.getCurrentLocation = function () {

		$ionicLoading.show({
		  template: 'Getting Current Position...'
		});

		// onSuccess Callback
		// This method accepts a Position object, which contains the
		// current GPS coordinates
		//
		var onSuccess = function(options) {
			var position = options.position
			postCB(options);
			$state.go('settings_details', {lat: position.coords.latitude, lng:position.coords.longitude});
		};

        // Currently below is not used. This can be renamed to onSuccess for debugging only
		var onSuccess1 = function(options) {
			var position = options.position
			postCB(options);
			alert('Latitude: '          + position.coords.latitude          + '\n' +
				  'Longitude: '         + position.coords.longitude         + '\n' +
				  'Altitude: '          + position.coords.altitude          + '\n' +
				  'Accuracy: '          + position.coords.accuracy          + '\n' +
				  'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
				  'Heading: '           + position.coords.heading           + '\n' +
				  'Speed: '             + position.coords.speed             + '\n' +
				  'Timestamp: '         + position.timestamp                + '\n');
			$state.go('settings_details', {lat: position.coords.latitude, lng:position.coords.longitude});

		};

		// onError Callback receives a PositionError object
		//
		var onError = function(options) {
			var error = options.error;
			postCB(options);
			var errorMessage = error.message;
			switch(error.code) {
				case error.PERMISSION_DENIED       : errorCodeShortDesc = "PERMISSION_DENIED"; break;
				case error.POSITION_UNAVAILABLE    : errorCodeShortDesc = "POSITION_UNAVAILABLE"; break;
				case error.TIMEOUT                 : errorCodeShortDesc = "TIMEOUT"; break;
			}
			$scope.showAlert(errorMessage);
		};


        var locationService = GSSearchLocationService.getCurrentLocation(
			{gps:GSSearchDataStore.getConfig().gps}
		);

		locationService.then(
			function(options) {
			  onSuccess(options);
		    },
			function(options) {
			  onError(options);
			},
			function(notificationData) {
				//$ionicLoading.hide();
				$ionicLoading.show({
				  template: 'Getting Current Position... <br>Attempts : '+notificationData.attempt+" <br>Accurracy(m) : "+notificationData.lastAccuracy
				});
			}
		  );

		var postCB = function(options){
			$ionicLoading.hide();
		};



	}



});
