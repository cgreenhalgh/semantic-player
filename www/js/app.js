var $http = angular.injector(['ng']).get('$http');

angular.module('semanticplayer', ['ionic'])

.run(function($ionicPlatform) {
	$ionicPlatform.ready(function() {
		// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard for form inputs)
		if(window.cordova && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
		}
		if(window.StatusBar) {
			StatusBar.styleDefault();
		}
	});
})

.controller('renderingController', function($scope, $interval) {
	
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	$scope.audioContext = new AudioContext();
	
	$scope.showSensorData = false;
	//container for model primitives (angular needs an object to contain them!?)
	$scope.vars = {};
	$scope.dmos = ["location", "spatial", "mixing"];
	
	$scope.resetUI = function() {
		$scope.mappingLoadingThreads = 0;
		$scope.featureLoadingThreads = 0;
		$scope.rendering = null;
		$scope.accelerometerWatcher = null;
		$scope.geolocationWatcher = null;
		$scope.compassWatcher = null;
		$scope.statsControls = null;
		$scope.sliderControls = [];
	}
	
	$scope.dmoSelected = function() {
		if ($scope.vars.selectedDmo) {
			$scope.resetUI();
			var dmoUri = "audio/"+$scope.vars.selectedDmo;
			var loader = new OntologyLoader(dmoUri, $scope, $interval)
			loader.loadDmo("/config.n3");
		}
	}
	
	$scope.loadingString = function() {
		var loadedObjectString;
		if (!$scope.rendering || !$scope.rendering.tracksLoaded) {
			loadedObjectString = "audio";
		} else if ($scope.mappingLoadingThreads && $scope.mappingLoadingThreads > 0) {
			loadedObjectString = "ontologies (mappings)";
		} else if ($scope.featureLoadingThreads && $scope.featureLoadingThreads > 0) {
			loadedObjectString = "ontologies (features)";
		}
		if (loadedObjectString) {
			return "Loading " + loadedObjectString + "..."
		}
		return null;
	}
	
	//INIT SELECTION
	$scope.vars.selectedDmo = $scope.dmos[0];
	$scope.dmoSelected();
	
	$scope.toggleSensorData = function() {
		$scope.showSensorData = !$scope.showSensorData;
	}
	
});
