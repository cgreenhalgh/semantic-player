/**
 * A control based on the distance from a bluetooth beacon
 * @constructor
 * @extends {SensorControl}
 */
function BeaconControl(uuid, major, minor) {
	
	var self = this;
	
	SensorControl.call(this, BEACON,
		"$cordovaBeacon",
		null,
		function() {},
		null,
		null,
		true
	);
	//this.setAverageOf(3);
	
	this.startUpdate = function() {
 		// Note: non-standard function for beacon plugin - use https://github.com/cgreenhalgh/cordova-plugin-ibeacon
		try {
			cordova.plugins.locationManager.setRssiFilterRunningAverage(2000);
		}
		catch (err) {
			console.log('Error setting RSSI filter on locationManager '+cordova.plugins.locationManager+': '+err.message,err);
		}
 
		var region = self.getSensor().createBeaconRegion("smpBeacons", uuid)
		self.getSensor().startRangingBeaconsInRegion(region);
		self.getScope().$on("$cordovaBeacon:didRangeBeaconsInRegion", function(event, region) {
			for (var b in region.beacons) {
				b = region.beacons[b]
				if (b.major == major && b.minor == minor) {
					self.update(b.accuracy);
					return;
				}
			}
			// not found
			self.update(Number.POSITIVE_INFINITY);
		});
	}
	
}
inheritPrototype(BeaconControl, SensorControl);
