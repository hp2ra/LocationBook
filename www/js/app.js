// *******************************************************
// First Ionic app created by Raghu Alwar from Bengaluru, INDIA
// Created app with name as Location Book / GSSearch (Google-Sygic Search)
//
// Created to as part
// a. Learning basics of AngularJS and Iconic.
// b. This app is for personal use.
//
// Features of app and reason for creating the app
// Reason 1 - Need of Travel / Location Book
// During planning a driving tour we decide on places to visit, as i use offline navigation (Sygic).
// I wanted to have an app that would store these location which can be integrated with Sygic
//
// Reason 2 - Google Search with Sygic Navigation
// For maps and naviation i do like google maps a lot and is the best
// however many times i do use the offline maps and like Sygic as i found it be
// pretty good. But i prefer Google search.
// Hence needed  a mix of Google Search (accessed with net) and
// navigate with Sygic Offline route.
// I know Nokia HERE is good but i really like Sygic
// Feature: Using Google maps service
// (optionally Maps API you can create your own API key and use that)
//
// Reason 3 - Share your location
// Modern mobile that is economical come with GPS which can be used without mobile data.
// Hence instead explaining some on location where i am current i felt it would be best to share current location in Latitude and Longitude.
// This can be used in google maps or in this app to be later used for navigation
//
// Reason 4 - Develop mobile app with lesser knowledge
// I am not an export GUI developer but have worked on HTML and JavaScript and even JAVA.
// (Have not explored on native android app but once i tried and it was mentioend to change text etc in an XML and that is tedious for me)
// Wanted to develop app much faster and with minimal effort.
// I currently use a personal app created last year with JQuery mobile (its only a location search and open sygic)
// Recently i was learning AngularJS and came to know about Ionic and its awesome.
// (I am very sure others can even do a better looking app than this..)
//
// As mentioned i am not a UI expert and hence have only used things from Ionic.
//
// Still have plans to expand further
// Need to build grouping the location
// Need to Export/Import the locations
// *******************************************************

var gssearchAppCtrl = angular.module('gssearch.controllers', []);
var gssearchAppDataServ = angular.module('gssearch.services',[]);

var gssearchApp = angular.module('gssearch', ['ionic', 'ngCordova', 'gssearch.controllers','gssearch.services']);

gssearchApp.config(function($stateProvider, $urlRouterProvider){

	$stateProvider.state("list_details", {
		url:"/list/details/:entryId",
		views:{
		 "tab-home": {
	  	    templateUrl:"templates/details.html",
	  	    controller:"ListDetailsCtrl"
		  }
	    }
	});

	$stateProvider.state("list", {
		url:"/list",
		views:{
		 "tab-home": {
	  	    templateUrl:"templates/list.html",
		    resolve:{
              "check":function($location, GSSearchDataStore){
				 if ( GSSearchDataStore && GSSearchDataStore.retrieveAll() && GSSearchDataStore.retrieveAll().length == 0 ) {
					 // Go to Search Page
					 $location.path('/search');
				 }
			   }
		    }
		  }
	    }
	});

	$stateProvider.state("search", {
		url:"/search",
		views:{
		 "tab-search": {
	  	    templateUrl:"templates/search.html"
		  }
	    }
	});


	$stateProvider.state("search_details", {
		url:"/search/details/:entryId",
		views:{
		 "tab-search": {
	  	    templateUrl:"templates/details.html",
	  	    controller:"SearchDetailsCtrl"
		  }
	    }
	});

	$stateProvider.state("settings", {
		url:"/settings",
		views:{
		 "tab-settings": {
	  	    templateUrl:"templates/settings.html"
		  }
	    }
	});


	$stateProvider.state("settings_details", {
		url:"/settings/details/:lat/:lng",
		views:{
		 "tab-settings": {
	  	    templateUrl:"templates/details.html",
	  	    controller:"SettingsCurrentLocationDetailsCtrl"
		  }
	    }
	});


	$urlRouterProvider.otherwise("/list");
});


gssearchApp.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }

    if(window.cordova && window.cordova.plugins.InAppBrowser) {
      window.open = window.cordova.plugins.InAppBrowser.open;
    }

    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});


