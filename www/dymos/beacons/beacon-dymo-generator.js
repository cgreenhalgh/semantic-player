// Room is rectangular. Consider a floor plan, with positions relative to page:
// Beacons are placed 1/A top-left, 2/B top-centre, 
// 3/C top-right, 4/D bottom-right, 5/E bottom centre, 6/F bottom-right.
// Beacon 3/C is a special case and has more localised sound than the others.
// The "upwards" reference heading is the heading of 2/B compared to magnetic north.

var centerBeaconRange = 0.8; //distance in meters at which the center beacon activates clean mode
var areaBeaconRange = 4; //distance in meters at which the audio associated with the beacon is no longer audible
var areaBeaconClose = 1; // distance in meters up to which audio associated with beacon is full volume
var area3BeaconRange = 1.5; // special case short range for beacon 3
var width = 10; // width of room (left/right) in metres
var depth = 6; // depth of room (top/bottom)
var referenceHeading = 174; // heading of "top-centre" (2/B), degrees

var maxAmplitude = 0.5; //maximum amplitude at which each clip is played back
var uuid = "f7826da6-4fa2-4e98-8024-bc5b71e0893e";
var beacons = [
	{"major":49933,"minor":16629}, // 'centre', SzyX //this one is taken as the center beacon
	{"major":57811,"minor":32951}, // 'A', IXWy //all following ones are assumed to be arranged clockwise
	{"major":63030,"minor":38015}, // 'B', PFZW
	{"major":22570,"minor":15614}, // 'C', 6ipO
	{"major":6286,"minor":31905}, // 'D', Qjrk
	{"major":34762,"minor":8686}, // 'E', 5GOb
	{"major":34015,"minor":52180} // 'F', 3VGI
];
var dirtySoundFiles = [
	"pad.m4a",
	"piano.m4a",
	"blib.m4a",
	"drums.m4a",
	"bass.m4a",
	"flav.m4a"
];
var cleanSoundFiles = [
	"pad.m4a",
	"piano.m4a",
	null,
	"drums.m4a",
	"bass.m4a",
	"flav.m4a"
];

//generate dymo
var dymo = {
	"@context":"http://tiny.cc/dymo-context",
	"@id":"beacons",
	"@type":"Dymo",
	"cdt":"parallel",
	"parts":[{
		"@id":"dirty",
		"@type":"Dymo",
		"cdt":"parallel",
		"parts":[]

	},{
		"@id":"clean",
		"@type":"Dymo",
		"cdt":"parallel",
		"parts":[],
		"parameters":[
		 		{"@type":"Amplitude", "value":0}
		 ]
	}],
	"mappings":[]
};
function smooth(expression, delta, interval) {
	// function tries to smooth result
//	return '(function(self) { var $injector = angular.injector([\'ng\']); $injector.invoke(function($interval) {'+
//	'var target = '+expression+'; if(self.smoothCurrent===undefined || Math.abs(target-self.smoothCurrent)<'+delta+')'+
//	'{self.smoothCurrent=target; if(self.smoothInterval!==undefined){ $interval.cancel(self.smoothInterval); delete self.smoothInterval; console.log(\'cancel smooth\'); }; }; '+
//	'self.smoothCurrent=(1-'+alpha+')*self.smoothCurrent+'+alpha+'*target; if(self.smoothInterval===undefined) {'+
//	'self.smoothInterval = $interval(function() { console.log(\'smooth!\'); self.updateParameter(); }, '+interval+'); }; }); return self.smoothCurrent; })(this);';
	return '(function(self) { '+
	'var target = '+expression+'; if(self.smoothCurrent===undefined || Math.abs(target-self.smoothCurrent)<'+delta+')'+
	'{self.smoothCurrent=target; if(self.smoothInterval!==undefined && '+
	'self.smoothInterval!==null){ clearInterval(self.smoothInterval); self.smoothInterval=null; }; } '+
	'else { self.smoothCurrent=Number(self.smoothCurrent)+(target>self.smoothCurrent ? '+delta+' : -'+delta+'); '+
	'console.log(\'smooth -> \'+self.smoothCurrent+\' vs \'+target); '+
	'if(self.smoothInterval===undefined || self.smoothInterval===null) {'+
	'self.smoothInterval = setInterval(function() { console.log(\'smooth!\'); self.updateParameter(); }, '+
	interval+'); }; }; return self.smoothCurrent; })(this);';
}

for (var i = 0; i < dirtySoundFiles.length; i++) {
	dymo["parts"][0]["parts"].push({
		"@id":"dirtyArea"+i,
		"@type":"Dymo",
		"source":dirtySoundFiles[i],
		"parameters":[
			{"@type":"Loop", "value":1},
			{"@type":"Amplitude", "value":maxAmplitude}
		]
	});
	dymo.mappings.push({
		"domainDims":[{"name":"DirtySmooth","@type":"Parameter"},{"name":"Track"+i,"@type":"Parameter"}],
		"function":{"args":["a","b"],"body":"return a*b*"+maxAmplitude+";"},
		"dymos":["dirtyArea"+i],
		"range":"Amplitude"
	});
}

for (var i = 0; i < cleanSoundFiles.length; i++) {
	if (cleanSoundFiles[i]===null)
		continue;
	dymo["parts"][1]["parts"].push({
		"@id":"cleanArea"+i,
		"@type":"Dymo",
		"source":cleanSoundFiles[i],
		"parameters":[
			{"@type":"Loop", "value":1},
			{"@type":"Amplitude", "value":0}
		]
	});
	// pos
	var y = (i==0 || i==5) ? width/2 : ((i==2 || i==3) ? -width/2 : 0);
	var x = i<=2 ? depth/2 : -depth/2;
	var r = Math.sqrt(x*x+y*y);
	// angles
	var heading = referenceHeading + 360 - Math.atan2(y,x)*180/Math.PI;
	heading = heading-360*Math.floor(heading/360);
	// offset angles
	var closeAngle = Math.atan(areaBeaconClose/r)*180/Math.PI;
	var rangeAngle = Math.atan((i==2 ? area3BeaconRange : areaBeaconRange)/r)*180/Math.PI;
		
	dymo.mappings.push({
		"domainDims":[{"name":"CleanSmooth","@type":"Parameter"},{"name":"Compass","@type":"Parameter"}],
		"function":{"args":["b","a"],"body":"return b*"+maxAmplitude+"*pwl((a-"+heading+"+180)-360*Math.floor((a-"+heading+"+180)/360)-180, [-"+rangeAngle+",0,-"+closeAngle+",1,"+closeAngle+",1,"+rangeAngle+",0],0);"},
		"dymos":["cleanArea"+i],
		"range":"Amplitude"
	});
}

// can't map to range until it is implicitly created!
dymo.mappings.push({
	"domainDims":[{"name":"Clean","@type":"Parameter"}],
	"function":{"args":["a"],"body":"return "+smooth('a', 0.05, 100)},
	"dymos":["beacons"],
	"range":"CleanSmooth"
});
dymo.mappings.push({
	"domainDims":[{"name":"Dirty","@type":"Parameter"}],
	"function":{"args":["a"],"body":"return "+smooth('a', 0.05, 100)},
	"dymos":["beacons"],
	"range":"DirtySmooth"
});

//generate rendering
var rendering = {
	"@context":"http://tiny.cc/dymo-context",
	"@id":"beaconsRendering",
	"@type":"Rendering",
	"dymo":"beacons",
	"mappings":[{
		"domainDims":[{
			"name":"compass",
			"@type":"CompassHeading"
		}],
		"function":{"args":["a"],"body":"return a-360*Math.floor(a/360);"},
		"dymos":["beacons"],
		"range":"Compass"
	},
	{
		"domainDims":[{
			"name":"compass slider",
			"@type":"Slider",
			"value":0
		}],
		"function":{"args":["a"],"body":"return a*360;"},
		"dymos":["beacons"],
		"range":"Compass"
	},
	{
		"domainDims":[{
			"name":"centre",
			"@type": "Slider",
			"value":0
		}],
		"function":{"args":["a"],"body":"return a;"},
		"dymos":["beacons"],
		"range":"Clean"
	},
	{
		"domainDims":[{
			"name":"edge",
			"@type": "Slider",
			"value":1
		}],
		"function":{"args":["a"],"body":"return a;"},
		"dymos":["beacons"],
		"range":"Dirty"
	},
	{
		"domainDims":[{
			"name":"centre smooth",
			"@type": "Slider",
			"value":0
		}],
		"function":{"args":["a"],"body":"return a;"},
		"dymos":["beacons"],
		"range":"CleanSmooth"
	},
	{
		"domainDims":[{
			"name":"edge smooth",
			"@type": "Slider",
			"value":1
		}],
		"function":{"args":["a"],"body":"return a;"},
		"dymos":["beacons"],
		"range":"DirtySmooth"
	}]
};
//add mappings for center beacon
rendering["mappings"].push({
	"domainDims":[{
		"name":"centerBeacon",
		"@type":"Beacon",
		"uuid":uuid,
		"major":beacons[0].major,
		"minor":beacons[0].minor
	}],
	"function":{"args":["a"],"body":"return a<"+centerBeaconRange+"?1:0;"},
	"dymos":["beacons"],
	"range":"Clean"
});
rendering["mappings"].push({
	"domainDims":[{
		"name":"centerBeacon",
		"@type":"Beacon",
                "uuid":uuid,
                "major":beacons[0].major,
                "minor":beacons[0].minor
	}],
	"function":{"args":["a"],"body":"return a<"+centerBeaconRange+"?0:1;"},
	"dymos":["beacons"],
	"range":"Dirty"
});
//add mappings for beacon areas
for (var i = 0; i < dirtySoundFiles.length; i++) {
	rendering["mappings"].push({
		"domainDims":[{
			"name":"beacon"+i,
			"@type":"Beacon",
			"uuid":uuid,
			"major":beacons[i+1].major,
			"minor":beacons[i+1].minor
		}],
		"function":{"args":["a"],"body":"return pwl(a,["+areaBeaconClose+",1,"+(i==2 ? area3BeaconRange: areaBeaconRange)+",0],0);"},
		"dymos":["beacons"],
		"range":"Track"+i
	});
	rendering["mappings"].push({
		"domainDims":[{
			"name":"track slider"+i,
			"@type":"Slider",
			"value":0
		}],
		"function":{"args":["a"],"body":"return a;"},
		"dymos":["beacons"],
		"range":"Track"+i
	});
}

//write it all to files
var fs = require('fs');
fs.writeFile("www/dymos/beacons/dymo.json", JSON.stringify(dymo, null, '\t'), function(err) {
	console.log("Dymo saved");
});
fs.writeFile("www/dymos/beacons/rendering.json", JSON.stringify(rendering, null, '\t'), function(err) {
	console.log("Rendering saved");
}); 
