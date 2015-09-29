angular.module('gssearch.controllers')
  .controller("ListDetailsCtrl", function($scope, $state, $cordovaSocialSharing, $cordovaClipboard, GSSearchDataStore){

	$scope.entry  = GSSearchDataStore.searchLocationById( $state.params.entryId );

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

    $scope.addAndOpenSygic = function(entryId, lat, lng) {
		GSSearchDataStore.addToStore(entryId);
		GSSearchDataStore.openSygic(lat, lng);
	};

	$scope.copyToClipboard = function (entryId) {
		GSSearchDataStore.copyToClipboard($cordovaClipboard, GSSearchDataStore.searchLocationById( entryId ) );
	}

	$scope.shareLocation = function (entryId) {
		GSSearchDataStore.shareLocation($cordovaSocialSharing, GSSearchDataStore.searchLocationById( entryId ) );
	}

	$scope.entry.mapEndpoint = GSSearchDataStore.getStaticMapURL($scope.entry.latitude,$scope.entry.longitude);
  });
