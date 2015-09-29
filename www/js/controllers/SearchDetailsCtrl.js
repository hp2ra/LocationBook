angular.module('gssearch.controllers')
  .controller("SearchDetailsCtrl", function($scope, $state, $ionicHistory, $cordovaSocialSharing, $cordovaClipboard, GSSearchDataStore, GSSearchShareState){
	$scope.detailsVars = {};
    $scope.detailsVars.forSearchOnly = true;
    $scope.detailsVars.addressClickCounter = 0;
	$scope.entry  = GSSearchShareState.searchLocationById( $state.params.entryId );

    var appConfig = GSSearchDataStore.getConfig();

    $scope.zoomMin = appConfig.staticMapConfig.zoomMin;
    $scope.zoomMax = appConfig.staticMapConfig.zoomMax;

    if ( ! appConfig.saveOrigAddress ) {
		$scope.editAddress=true;
	}

    $scope.entry.formatted_address = GSSearchDataStore.maskAddress($scope.entry.display_name,
              $scope.entry.formatted_address, $scope.entry.latitude, $scope.entry.longitude);

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
		GSSearchShareState.addToStore(entryId);
		GSSearchDataStore.openSygic(lat, lng);
	};

	$scope.copyToClipboard = function (entryId) {
		GSSearchDataStore.copyToClipboard($cordovaClipboard, GSSearchShareState.searchLocationById( entryId ) );
	}

	$scope.shareLocation = function (entryId) {
		GSSearchDataStore.shareLocation($cordovaSocialSharing, GSSearchShareState.searchLocationById( entryId )  );
	}

	$scope.entry.mapEndpoint = GSSearchDataStore.getStaticMapURL($scope.entry.latitude,$scope.entry.longitude);

    // Minor trick to copy over address
	$scope.addressToClip = function(address) {
		$scope.detailsVars.addressClickCounter += 1;
		console.log($scope.detailsVars);
		if ( $scope.detailsVars.addressClickCounter > 10 ) {
          $scope.entry.display_address   = address;
          $scope.entry.formatted_address = address;
		  $scope.detailsVars.addressClickCounter = 0;
		}
		GSSearchDataStore.copyToClipboard($cordovaClipboard, address);
	}

  }).directive('textarea', function() {
  return {
    restrict: 'E',
    link: function(scope, element, attr){
        var update = function(){
            element.css("height", "auto");
            var height = element[0].scrollHeight + 10;
            element.css("height", height + "px");
        };
        scope.$watch(attr.ngModel, function(){
            update();
        });
    }
  };
});;
