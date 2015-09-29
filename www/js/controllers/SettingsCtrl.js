angular.module('gssearch.controllers')
  .controller("SettingsCtrl", function($scope, $ionicPopup, $ionicLoading, $cordovaGeolocation, $state, GSSearchDataStore){

	var init = function () {
		$scope.appConfig = angular.copy(GSSearchDataStore.getConfig());
		$scope.appConfig.apikeys = $scope.appConfig.apikeys || [];
		$scope.appConfig.onSearchRemoveInvalidAPIKeys = $scope.appConfig.onSearchRemoveInvalidAPIKeys || false;
		$scope.appConfig.sygicURLScheme = $scope.appConfig.sygicURLScheme || GSSearchDataStore.getDefaultSygicURLScheme();
		$scope.appConfig.gps.timeout = $scope.appConfig.gps.timeout || 120000;
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
		                                     gps:{enableHighAccuracy:$scope.appConfig.gps.enableHighAccuracy, timeout:$scope.appConfig.gps.timeout}
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

        var posOptions = {
            enableHighAccuracy: GSSearchDataStore.getConfig().gps.enableHighAccuracy,
            timeout: GSSearchDataStore.getConfig().gps.timeout,
            maximumAge: 0
        };


		$ionicLoading.show({
		  template: 'Getting Current Position...'
		});

		// onSuccess Callback
		// This method accepts a Position object, which contains the
		// current GPS coordinates
		//
		var onSuccess = function(position) {
			postCB();
			$state.go('settings_details', {lat: position.coords.latitude, lng:position.coords.longitude});
		};

		var onSuccessDisp = function(position) {
			postCB();
			alert('Latitude: '          + position.coords.latitude          + '\n' +
				  'Longitude: '         + position.coords.longitude         + '\n' +
				  'Altitude: '          + position.coords.altitude          + '\n' +
				  'Accuracy: '          + position.coords.accuracy          + '\n' +
				  'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
				  'Heading: '           + position.coords.heading           + '\n' +
				  'Speed: '             + position.coords.speed             + '\n' +
				  'Timestamp: '         + position.timestamp                + '\n');
		};

		// onError Callback receives a PositionError object
		//
		var onError = function(error) {
			postCB();
			$scope.showAlert('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
		};

		var postCB = function(){
			$ionicLoading.hide();
		};

		navigator.geolocation.getCurrentPosition(onSuccess, onError, posOptions);
	}



});
