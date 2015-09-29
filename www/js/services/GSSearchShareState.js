(function(){
  angular.module("gssearch.services").
  factory('GSSearchShareState',function(GSSearchDataStore){
	var searchedOutList = [];

    return {

		getConfig : function () {
			return GSSearchDataStore.getConfig();
		},

		retrieveAll : function () {
			return searchedOutList;
		},

		setSearchList: function (list) {
			searchedOutList = list;
		},

		searchLocationById : function ( entryId ) {
			var num = searchedOutList.length;
			for(var i=0; i < num; i++) {
				if ( searchedOutList[i].id == entryId ) {
					return searchedOutList[i];
				}
			}
			return undefined;
		},

		searchLocationByPosition : function ( lat, lng ) {
			var num = searchedOutList.length;
			for(var i=0; i < num; i++) {
				if ( searchedOutList[i].latitude == lat && searchedOutList[i].longitude == lng ) {
					return i;
				}
			}
			return undefined;
		},

		addLocation : function ( location, options ) {
			options = options || {};
			options.idPrefix = options.idPrefix || 0;
			var locIndex = this.searchLocationByPosition(location.latitude, location.longitude);

			if ( locIndex == undefined ) {
				var someId=new Date().valueOf();
                location.id=(options.isPlace?"PLACE_" : "GENERAL_")+options.idPrefix+someId;
                location.stype_is_address = options.isAddress||false;
                location.stype_is_place = options.isPlace||false;
				searchedOutList.splice(0, 0, location );
			}
			return searchedOutList;
		},

		addToStore : function ( entryId ) {
			var entry = this.searchLocationById(entryId);
			if ( entry ) {
				GSSearchDataStore.addLocation(entry.place, entry.display_name, entry.formatted_address, entry.latitude, entry.longitude);
			}
		}
	};
  });
})();