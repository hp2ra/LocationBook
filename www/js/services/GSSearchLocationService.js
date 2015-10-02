(function(){
  angular.module("gssearch.services").
  factory('GSSearchLocationService',['$cordovaGeolocation', '$q',function($cordovaGeolocation, $q){
    function _getLocation(options){
		var callStart  = options.callStart;
		var deferred   = options.deferred;
		var attempt    = options.attempt;
		var othOptions = options.othOptions;

        deferred.notify({attempt: attempt, message:'Searching attempt '+attempt, lastAccuracy : options.lastAccuracy});

        var getLocOptions = {
            enableHighAccuracy: othOptions.gps.enableHighAccuracy,
            timeout: othOptions.gps.timeout * 100,
            maximumAge: 0
        };

        var locWatch = $cordovaGeolocation.watchPosition(getLocOptions);
        locWatch.then(
           null,
           function(err) {
			   locWatch.clearWatch();
			   deferred.reject({err:err});
		   },
		   function(position) {
			   var callEnd = new Date().getTime() / 1000;
			   locWatch.clearWatch();
			   if ( position.coords.accuracy && position.coords.accuracy <= othOptions.gps.accuracy ) {
				   // This is good accuracy then accept it
                   deferred.resolve({status:0, position:position});
			   } else if ( (callEnd - callStart) < othOptions.gps.timeout ) {
  			     // Keep trying till the configured wait time. If exceeds then return back.
				 options.attempt++;
				 options.lastAccuracy = Math.round(position.coords.accuracy * 100) / 100;
				 options.minAccuracy = options.minAccuracy || options.lastAccuracy; // Default
				 options.minAccuracy = options.minAccuracy < options.lastAccuracy ? options.lastAccuracy : options.minAccuracy;
                 _getLocationWrapper(options);
			   } else {
				   othOptions.gps.timeout
				   deferred.reject( {error:{code:-999, message:"Could not get location.<br>Most min accuracy is "+options.minAccuracy+" mts.<br>Try to check location in open area or try adjusting to acceptable accuracy."}} );
			   }
		   }
		);

	}


	function _getLocationWrapper(options) {
		 var locCB=function(){return _getLocation(options);};
		 if ( options.attempt == 1 ) {
			 locCB();
		 } else {
           setTimeout(locCB, options.othOptions.gps.interval*1000);
	     }
	}

    return {

		getCurrentLocation : function (options) {
			var deferred = $q.defer();
            callStart = new Date().getTime() / 1000;
            _getLocationWrapper({callStart:callStart, deferred:deferred, othOptions:options, attempt:1});
			return deferred.promise;
		}
	};
  }]);
})();