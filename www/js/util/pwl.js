pwl = function (inval, map, def) {
	if (inval===null || inval===undefined) return def;
	var lin=inval, lout=map[1], i;
	for (i=0; i+1<map.length; i=i+2) {
		if (inval==map[i]) return map[i+1];
		if (inval<map[i]) return lout+(map[i+1]-lout)*(inval-lin)/(map[i]-lin);
		lin=map[i]; lout=map[i+1];
	}
	if (map.length>=2) return map[map.length-1];
	return inval;
}
