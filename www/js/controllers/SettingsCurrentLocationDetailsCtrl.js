angular.module('gssearch.controllers')
  .controller("SettingsCurrentLocationDetailsCtrl", function($scope, $state, $cordovaSocialSharing, $cordovaClipboard, GSSearchDataStore){

    $scope.editAddress=true;
	$scope.entry  = {
						"id" : "LOCATION_THIS_"+new Date().valueOf(),
						"place" : "Current Location",
						"display_name": "Current Location",
						"formatted_address" : "Latitude/Longitude : "+$state.params.lat+" @ "+$state.params.lng,
						"latitude"  : $state.params.lat,
						"longitude" : $state.params.lng};

    var appConfig = GSSearchDataStore.getConfig();

    $scope.zoomMin = appConfig.staticMapConfig.zoomMin;
    $scope.zoomMax = appConfig.staticMapConfig.zoomMax;
    $scope.entry.zoomSize=appConfig.staticMapConfig.defaultZoomSize;
    $scope.zoomIn = function() {
		if ( $scope.entry.zoomSize < appConfig.staticMapConfig.zoomMax + 1 ) {
			$scope.entry.zoomSize++;
		}
	};

    $scope.zoomOut = function() {
		if ( $scope.entry.zoomSize > appConfig.staticMapConfig.zoomMin ) {
			$scope.entry.zoomSize--;
		}
	};

    $scope.add = function(place, display_name, formatted_address, lat, lng) {
		GSSearchDataStore.addLocation(place, display_name, formatted_address, lat, lng);
		$state.go('list');
	};

    $scope.addAndOpenSygic = function(entryId, lat, lng) {
		GSSearchDataStore.addLocation($scope.entry.place, $scope.entry.display_name, $scope.entry.formatted_address, lat, lng);
		GSSearchDataStore.openSygic(lat, lng);
	};

    var fixDisplayName=function(){
      if ($scope.entry.display_name == "") {
		  $scope.entry.display_name = $scope.entry.place;
	  }
	}

	$scope.copyToClipboard = function () {
		GSSearchDataStore.copyToClipboard($cordovaClipboard, {latitude:$scope.entry.latitude, longitude:$scope.entry.longitude} );
	}

	$scope.shareLocation = function () {
		GSSearchDataStore.shareLocation($cordovaSocialSharing, {latitude:$scope.entry.latitude, longitude:$scope.entry.longitude} );
	}

	$scope.entry.mapEndpoint = GSSearchDataStore.getStaticMapURL($scope.entry.latitude,$scope.entry.longitude);
});

