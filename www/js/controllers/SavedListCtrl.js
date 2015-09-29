angular.module('gssearch.controllers')
  .controller("SavedListCtrl", function($scope, $ionicListDelegate, GSSearchDataStore){
	$scope.recentEntries = GSSearchDataStore.retrieveAll();

	$scope.remove = function ( entryId ) {
		GSSearchDataStore.remove(entryId);
	};

	$scope.move = function ( entry, fromIndex, toIndex ) {
		GSSearchDataStore.move(entry, fromIndex, toIndex);
	};

    $scope.openSygic = function(lat, lng) {
		$ionicListDelegate.closeOptionButtons();
		GSSearchDataStore.openSygic(lat, lng);
	}

	$scope.reordering=false;
	$scope.toggleReorder = function () {
		$scope.reordering=!$scope.reordering;
	}
  });
