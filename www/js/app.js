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

.controller('renderingController', function($scope) {
	$scope.rendering;
	$scope.sliderControls = [];
	//container for model primitives (angular needs an object to contain them!?)
	$scope.vars = {};
	$scope.dmos = ["example"];
	
	$scope.dmoSelected = function() {
		if ($scope.vars.selectedDmo) {
			var dmoUri = "audio/"+$scope.vars.selectedDmo;
			var rdfUri = "/example.n3";
			new OntologyLoader(dmoUri, $scope).loadDmo(rdfUri);
		}
	}
	
	//INIT SELECTION
	$scope.vars.selectedDmo = $scope.dmos[0];
	$scope.dmoSelected();
});
