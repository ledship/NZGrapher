function newresiduals() {

	$('#xvar').show();
	$('#yvar').show();
	$('#labelshow').show();
	$('#greyscaleshow').show();
	$('#sizediv').show();
	$('#removedpointsshow').show();
	$('#pointsizename').html('Point Size:');
	$('#transdiv').show();
	$('#residualsforcexshow').show();
	$('#regtypeshow').show();
	$('#weightedaverageshow').show();
	$('#colorname').show();
	//$('#color')[0].selectedIndex = 0;

	var canvas = document.getElementById('myCanvas');
	var ctx = canvas.getContext('2d');

	//set size
	var width = $('#width').val();
	var height = $('#height').val();

	ctx.canvas.width = width;
	ctx.canvas.height = height;

	ctx.fillStyle = "#ffffff";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	var betterColours = false;
	if ($('#bettercolours').is(":checked") && $('#bettercoloursshow').is(":visible")) {
		betterColours = true;
	}

	//graph title
	ctx.fillStyle = '#000000';
	drawTitle(ctx, $('#title').val(), width / 2, 30 * scalefactor, 20);

	if ($('#residualsforcex').is(":checked")) {
		xtitle = "Explanatory";
		residualsforcex = "yes";
	} else {
		xtitle = "Fitted";
		residualsforcex = "no";
	}

	//x-axis title
	ctx.fillStyle = '#000000';
	ctx.font = "bold " + 15 * scalefactor + "px Roboto";
	ctx.textAlign = "center";
	ctx.fillText(xtitle, width / 2, height - 10 * scalefactor);

	//y-axis title
	x = 20 * scalefactor;
	y = height / 2;
	ctx.save();
	ctx.fillStyle = '#000000';
	ctx.font = "bold " + 15 * scalefactor + "px Roboto";
	ctx.translate(x, y);
	ctx.rotate(-Math.PI / 2);
	ctx.textAlign = "center";
	ctx.fillText("Residual", 0, 0);
	ctx.restore();

	//get points
	var xpoints = $('#xvar').val().split(",");
	xpoints.pop();
	var ypoints = $('#yvar').val().split(",");
	ypoints.pop();

	//check for numeric value
	var points = [];
	var pointsremoved = [];
	var pointsforminmax = [];
	var pointsforminmaxy = [];
	countx = 0;
	county = 0;
	for (var index in xpoints) {
		if ($.isNumeric(xpoints[index])) {
			countx++;
		}
		if ($.isNumeric(ypoints[index])) {
			county++;
		}
		if ($.isNumeric(xpoints[index]) && $.isNumeric(ypoints[index])) {
			points.push(index);
			pointsforminmax.push(xpoints[index]);
			pointsforminmaxy.push(ypoints[index]);
		} else {
			pointsremoved.push(add(index, 1));
		}
	}

	if (countx == 0) {
		return 'Error: You must select a numeric variable for variable 1';
	}

	if (county == 0) {
		return 'Error: You must select a numeric variable for variable 2';
	}

	if (pointsremoved.length != 0 && $('#removedpoints').is(":checked")) {
		ctx.fillStyle = '#000000';
		ctx.font = 13 * scalefactor + "px Roboto";
		ctx.textAlign = "right";
		ctx.fillText("ID(s) of Points Removed: " + pointsremoved.join(", "), width - 40 * scalefactor, 40 * scalefactor);
	}

	if (points.length == 0) {
		return 'Error: You must select a numeric variable for variable 1';
	}

	pointstofit = [];
	for (var index in points) {
		var index = points[index];
		var xpoint = xpoints[index];
		var ypoint = ypoints[index];
		if (xpoint == 0) {
			xpoint = xpoint + 0.0000000000001;
		}
		if (ypoint == 0) {
			ypoint = ypoint + 0.0000000000001;
		}
		pointstofit.push([parseFloat(xpoint), parseFloat(ypoint)]);
	}

	regtype = $('#regtype').val();

	fitted = [];

	if (regtype == "Linear") {

		res = regression.linear(pointstofit, {
			precision: 7,
		});
		console.log(res);

		c = res.equation[1].toPrecision(5);
		m = res.equation[0].toPrecision(5);

		for (var index in points) {
			var index = points[index];
			var xpoint = xpoints[index];
			fitted[index] = add(m * xpoint, c).toPrecision(5);
		}
	} else if (regtype == "Quadratic") {

		res = regression.polynomial(pointstofit, {
			order: 2,
			precision: 7,
		});
		console.log(res);

		a = res.equation[0].toPrecision(5);
		b = res.equation[1].toPrecision(5);
		c = res.equation[2].toPrecision(5);

		for (var index in points) {
			var index = points[index];
			var xpoint = xpoints[index];
			fitted[index] = add(add(a * xpoint * xpoint, b * xpoint), c).toPrecision(5);
		}

	} else if (regtype == "Cubic") {

		res = regression.polynomial(pointstofit, {
			order: 3,
			precision: 10,
		});
		console.log(res);

		a = res.equation[0];
		b = res.equation[1];
		c = res.equation[2];
		d = res.equation[3];

		for (var index in points) {
			var index = points[index];
			var xpoint = xpoints[index];
			fitted[index] = add(add(add(a * xpoint * xpoint * xpoint, b * xpoint * xpoint), c * xpoint), d).toPrecision(5);
		}

	} else if (regtype == "y=a*exp(b*x)") {

		res = regression.exponential(pointstofit, {
			precision: 7,
		});
		console.log(res);

		a = res.equation[0].toPrecision(5);
		b = res.equation[1].toPrecision(5);

		for (var index in points) {
			var index = points[index];
			var xpoint = xpoints[index];
			fitted[index] = (a * Math.exp(b * xpoint)).toPrecision(5);
		}

	} else if (regtype == "y=a*ln(x)+b") {

		res = regression.logarithmic(pointstofit, {
			precision: 7,
		});
		console.log(res);

		a = res.equation[1].toPrecision(5);
		b = res.equation[0].toPrecision(5);

		for (var index in points) {
			var index = points[index];
			var xpoint = xpoints[index];
			if (xpoint == 0) {
				xpoint = xpoint + 0.0000000000001;
			}
			fitted[index] = add(a * Math.log(xpoint), b).toPrecision(5);
		}

	} else if (regtype == "y=a*x^b") {

		res = regression.power(pointstofit, {
			precision: 7,
		});
		console.log(res);

		a = res.equation[0].toPrecision(5);
		b = res.equation[1].toPrecision(5);

		for (var index in points) {
			var index = points[index];
			var xpoint = xpoints[index];
			fitted[index] = (a * Math.pow(xpoint, b)).toPrecision(5);
		}

	}

	residuals = [];
	var pointsforminmax = [];
	var pointsforminmaxy = [];

	for (var index in points) {
		var index = points[index];
		var ypoint = ypoints[index];
		var fit = fitted[index];
		residuals[index] = (ypoint - fit).toPrecision(5);
		pointsforminmaxy.push(ypoint - fit);
		if (residualsforcex == "yes") {
			fitted[index] = xpoints[index];
			fit = xpoints[index];
		}
		pointsforminmax.push(fit);
	}

	var alpha = 1 - $('#trans').val() / 100;
	var colors = makecolors(alpha, ctx);

	xmin = Math.min.apply(null, pointsforminmax);
	xmax = Math.max.apply(null, pointsforminmax);
	ymin = Math.min.apply(null, pointsforminmaxy);
	ymax = Math.max.apply(null, pointsforminmaxy);

	var minmaxstep = axisminmaxstep(xmin, xmax);
	var minxtick = minmaxstep[0];
	var maxxtick = minmaxstep[1];
	var xstep = minmaxstep[2];
	var minmaxstep = axisminmaxstep(ymin, ymax);
	var minytick = minmaxstep[0];
	var maxytick = minmaxstep[1];
	var ystep = minmaxstep[2];

	var left = 90 * scalefactor;
	var right = width - 60 * scalefactor;
	var gtop = 90 * scalefactor;
	var bottom = height - 60 * scalefactor;

	plotscatter(ctx, points, fitted, residuals, minxtick, maxxtick, xstep, minytick, maxytick, ystep, gtop, bottom, left, right, colors, betterColours);

	labelgraph(ctx, width, height);

	if ($('#invert').is(":checked")) {
		invert(ctx)
	}

	var dataURL = canvas.toDataURL();
	return dataURL;

}

function newbarandarea() {
	var canvas = document.getElementById('myCanvas');
	var ctx = canvas.getContext('2d');

	//set size
	var width = $('#width').val();
	var height = $('#height').val();
	ctx.canvas.width = width;
	ctx.canvas.height = height;

	ctx.fillStyle = "#ffffff";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// get points
	var xPoints = $('#xvar').val().split(',');
	xPoints.pop();
	var yPoints = $('#yvar').val().split(',');
	yPoints.pop();

	if (xPoints.length == 0) {
		return "Error: You must select an x-variable for a bar graph an x-variable and a y-variable for an area graph.";
	}

	// graph title
	ctx.fillStyle = '#000000';
	drawTitle(ctx, $('#title').val(), width / 2, 30 * scalefactor, 20);

	// x-axis title
	ctx.font = "bold " + 15 * scalefactor + "px Roboto";
	ctx.fillText($('#xaxis').val(), width / 2, height - 10 * scalefactor);

	var relativeFrequency = false;
	if ($('#relativefrequency').is(":checked") && $('#relativefrequencyshow').is(":visible")) {
		relativeFrequency = true;
	}
	var betterColours = false;
	if ($('#bettercolours').is(":checked") && $('#bettercoloursshow').is(":visible")) {
		betterColours = true;
	} else {
		var alpha = 1 - $('#trans').val() / 100;
		colours = makecolors(alpha, ctx, '#d3d3d3', false);
	}

	var left = 60 * scalefactor;
	var right = width - 60 * scalefactor;
	var gTop = 60 * scalefactor;
	var bottom = height - 60 * scalefactor;

	ctx.strokeStyle = '#000000';
	ctx.lineWidth = scalefactor;
	if (yPoints.length == 0) {
		// bar chart
		// y axis title
		ctx.save();
		ctx.translate(20 * scalefactor, height / 2);
		ctx.rotate(-Math.PI / 2);
		ctx.fillText("Frequency", 0, 0);
		ctx.restore();

		var freq = [];
		for (var index in xPoints) {
			var val = xPoints[index];
			freq[val] = (freq[val]) ? freq[val] + 1 : 1;
		}

		var keys = Object.keys(freq);
		keys.sort(sortorder);
		var num = keys.length;

		// y axis ticks
		var minY = 0.0001;
		var maxY = freq[keys[0]];
		var sum = 0;
		var origMin = 0;
		for (var i in keys) {
			var val = freq[keys[i]];
			if (val > maxY) {
				maxY = val;
			}
			if (val < origMin) {
				origMin = val;
			}
			sum += val;
		}
		if (relativeFrequency) {
			maxY = maxY / sum;
		} else {
			sum = 1;
		}

		var minMaxSteps = axisminmaxstep(minY, maxY);
		var minYTick = minMaxSteps[0];
		var maxYTick = (relativeFrequency) ? minMaxSteps[1] : Math.ceil(minMaxSteps[1] / 10) * 10;
		var yStep = minMaxSteps[2];

		vertaxis(ctx, gTop, bottom, left - 10 * scalefactor, minYTick, maxYTick, yStep, undefined, false);
		line(ctx, left - 10 * scalefactor, bottom, right, bottom);

		var eachWidth = (width - 120 * scalefactor) / num;
		var tLeft = 90 * scalefactor;
		ctx.font = 15 * scalefactor + "px Roboto";
		ctx.textAlign = "center";
		for (var i in keys) {
			ctx.fillStyle = '#000';
			var key = keys[i];
			var value = convertvaltopixel(freq[keys[i]] / sum, origMin / sum, maxYTick, bottom, gTop);
			var tRight = tLeft + eachWidth;
			ctx.fillText(key, add(tLeft, tRight - 50 * scalefactor) / 2, height - 40 * scalefactor);
			if (betterColours) {
				ctx.fillStyle = document.getElementById('primarycolour').value;
			} else {
				if ($('#color option:selected').text() == $('#xvar option:selected').text()) {
					ctx.fillStyle = colours[i];
				} else {
					ctx.fillStyle = '#d3d3d3';
				}
			}
			var yPixel = value;
			var x1 = add(tLeft, tRight - 50 * scalefactor) / 2 - ((eachWidth * 0.7) / 2);
			ctx.fillRect(x1, yPixel, eachWidth * 0.7, bottom - yPixel);
			ctx.strokeRect(x1, yPixel, eachWidth * 0.7, bottom - yPixel);
			tLeft += eachWidth;
		}
	} else {
		// Area chart
		// y axis title
		ctx.save();
		ctx.translate(20 * scalefactor, height / 2);
		ctx.rotate(-Math.PI / 2);
		ctx.fillText($('#yaxis').val(), 0, 0);
		ctx.restore();

		var categoriesY = array_unique(yPoints);
		var categoriesX = array_unique(xPoints);
		var countX = 0;
		var vals = [];
		for (var index in xPoints) {
			countX++;
			var val = xPoints[index];
			vals[val] = (vals[val]) ? vals[val] + 1 : 1;
		}
		var keys = Object.keys(vals);
		keys.sort(sortorder);

		var full = [];
		xPoints.forEach(function (ele) {
			full[ele] = [];
		});
		var i = 0;
		xPoints.forEach(function (xPoint) {
			var yPoint = yPoints[i];
			full[xPoint].push(yPoint);
			i++;
		});

		var xb = 50 * scalefactor;
		var eachWidth = (width - 100 * scalefactor);
		categoriesX.sort(sortorder);
		ctx.strokeWidth = scalefactor * 0.5;
		ctx.font = 15 * scalefactor + "px Roboto";
		categoriesX.sort(sortorder);
		categoriesX.forEach(function (catX) {
			ctx.fillStyle = '#000000';
			var percentX = (vals[catX] / countX);
			var xa = xb;
			xb = xa + (eachWidth * percentX);
			ctx.fillText(catX, (xa + xb) - ((xb + xa) / 2), height - 35 * scalefactor);

			var numY = full[catX].length;
			var tempArray = [];
			for (var index in full[catX]) {
				var val = full[catX][index];
				tempArray[val] = (tempArray[val]) ? tempArray[val] + 1 : 1;
			}
			var fullKeys = Object.keys(vals);
			fullKeys.sort(sortorder);
			full[catX] = tempArray;

			var yb = 50 * scalefactor;
			categoriesY.sort(sortorder);
			categoriesY.forEach(function (catY) {
				var ya = yb;
				if (full[catX].hasOwnProperty(catY)) {
					if (betterColours) {
						ctx.fillStyle = document.getElementById('primarycolour').value;
					} else {
						i = 0;
						if ($('#color option:selected').text() == $('#xvar option:selected').text() || $('#color option:selected').text() == $('#yvar option:selected').text()) {
							var usingCatX = $('#color option:selected').text() == $('#xvar option:selected').text() ? true : false;
							if ($('#color').val() && $('#color').val() != "") {
								var colorPoints = $('#color').val().split(',');
								colorPoints.pop();
								for (var cIndex in colorPoints) {
									var key = colorPoints[cIndex];
									if (usingCatX) {
										if (key == catX) {
											ctx.fillStyle = colours[i];
										}
									} else {
										if (key == catY) {
											ctx.fillStyle = colours[i];
										}
									}
									i++;
								}
							} else {
								ctx.fillStyle = '#d3d3d3';
							}
						} else {
							ctx.fillStyle = '#d3d3d3';
						}
					}
					yb = yb + (height - 100 * scalefactor) * full[catX][catY] / numY;
					ctx.fillRect(xa + 3 * scalefactor, ya + 3 * scalefactor, xb - xa - 3 * scalefactor, yb - ya - 3 * scalefactor);
					ctx.strokeRect(xa + 3 * scalefactor, ya + 3 * scalefactor, xb - xa - 3 * scalefactor, yb - ya - 3 * scalefactor);
					ctx.fillStyle = '#000000';
					ctx.textAlign = "center";
					ctx.fillText(catY, (xa + xb) / 2, (ya + yb) / 2 + 5 * scalefactor)
				}
			});
		});
	}

	labelgraph(ctx, width, height);

	if ($('#invert').is(":checked")) {
		invert(ctx);
	}

	return canvas.toDataURL();
}

function newhistogram() {
	var canvas = document.getElementById('myCanvas');
	var ctx = canvas.getContext('2d');

	//set size
	var width = $('#width').val();
	var height = $('#height').val();
	ctx.canvas.width = width;
	ctx.canvas.height = height;

	ctx.fillStyle = "#ffffff";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	var betterColours = false;
	if ($('#bettercolours').is(":checked") && $('#bettercoloursshow').is(":visible")) {
		betterColours = true;
	}

	// get points
	var xPoints = $('#xvar').val().split(',');
	xPoints.pop();
	var yPoints = $('#yvar').val().split(',');
	yPoints.pop();

	var i = 0;
	var pointsRemoved = "";
	for (var xPoint in xPoints) {
		xPoint = xPoints[xPoint];
		if (!$.isNumeric(xPoint)) {
			xPoints.splice(i, 1);
			yPoints.splice(i, 1);
			pointsRemoved += (i + 1) + ", ";
		}
		i++;
	}

	if (xPoints.length == 0 || !($.isNumeric(xPoints[0]))) {
		return 'Error: You must select a numerical x-variable';
	}

	if (pointsRemoved.length != 0) {
		ctx.fillStyle = '#000000';
		ctx.font = 13 * scalefactor + "px Roboto";
		ctx.textAlign = "right";
		ctx.fillText("ID(s) of Points Removed: " + pointsRemoved, width - 40 * scalefactor, 40 * scalefactor);
	}

	var numCategories = array_unique(yPoints).length;
	if (numCategories > 5 && $.isNumeric(yPoints[0])) {
		var min = Math.min.apply(null, yPoints);
		var max = Math.max.apply(null, yPoints);
		var range = max - min;
		var i = 0;
		var c1max = parseFloat(Number(min + range / 4).toPrecision(2));
		var c2max = parseFloat(Number(c1max + range / 4).toPrecision(2));
		var c3max = parseFloat(Number(c2max + range / 4).toPrecision(2));
		for (var yPoint in yPoints) {
			var value = yPoints[yPoint];
			if (value < c1max) {
				yPoints[i] = "a: < " + c1max;
			} else if (value < c2max) {
				yPoints[i] = "b: " + c1max + " - " + c2max;
			} else if (value < c3max) {
				yPoints[i] = "c: " + c2max + " - " + c3max;
			} else {
				yPoints[i] = "d: > " + c3max;
			}
			i++;
		}
		numCategories = 4;
	}
	if (numCategories > 5) {
		return 'Error: You must select a categorical y-variable with 4 or fewer categories or a numerical y-variable which will automatically be split into 4 categories.</center>';
	}
	if (numCategories == 0) {
		numCategories = 1;
		for (var index in xPoints) {
			yPoints[index] = " ";
		}
	}

	var relativeFrequency = false;
	if ($('#relativefrequency').is(":checked") && $('#relativefrequencyshow').is(":visible")) {
		relativeFrequency = true;
	}

	ctx.fillStyle = '#000000';
	drawTitle(ctx, $('#title').val(), width / 2, 30 * scalefactor, 20);

	ctx.font = "bold " + 15 * scalefactor + "px Roboto";
	ctx.fillText($('#xaxis').val(), width / 2, height - 10 * scalefactor);
	ctx.save();
	ctx.fillStyle = '#000000';
	ctx.font = "bold " + 15 * scalefactor + "px Roboto";
	ctx.translate(20 * scalefactor, height / 2);
	ctx.rotate(-Math.PI / 2);
	ctx.textAlign = "center";
	ctx.fillText($('#yaxis').val(), 0, 0);
	ctx.restore();

	var minX = Math.min.apply(null, xPoints);
	var maxX = Math.max.apply(null, xPoints);
	var minMaxSteps = axisminmaxstep(minX, maxX);
	var minXTick = minMaxSteps[0];
	var maxXTick = minMaxSteps[1] + minMaxSteps[2];
	var xStep = minMaxSteps[2];

	var left = 90 * scalefactor;
	var right = width - 80 * scalefactor;
	var gTop = 60 * scalefactor;
	var bottom = height - 60 * scalefactor;

	var i = 0;
	var data = [];
	var odata = [];
	xPoints.forEach(function (xPoint) {
		var yPoint = yPoints[i];
		var xBucket = Math.floor(xPoint / xStep) * xStep;
		if (!(yPoint in data)) {
			data[yPoint] = [];
		}
		if (!(yPoint in odata)) {
			odata[yPoint] = [];
		}
		data[yPoint].push(xBucket);
		odata[yPoint].push(xPoint);
		i++;
	});
	var maxFreq = [];
	for (var category in data) {
		var values = data[category];
		data[category] = array_count_values(values);
		var keys = Object.keys(data[category]);
		var sum = 0;
		var max = data[category][keys[0]];
		for (var key in keys) {
			key = keys[key];
			sum += data[category][key];
			if (data[category][key] > max) {
				max = data[category][key];
			}
		}
		if (!relativeFrequency) {
			sum = 1;
		}
		maxFreq.push(max / sum);
	}

	maxFreq = Math.max.apply(null, maxFreq);
	var numCategories = Object.keys(data).length;

	var minY = 0.0001;
	var maxY = maxFreq;
	minMaxSteps = axisminmaxstep(minY, maxY);
	var minYTick = minMaxSteps[0];
	var maxYTick = minMaxSteps[1];
	var yStep = minMaxSteps[2];

	var bottomStart = bottom + 30 * scalefactor;
	var dataKeys = Object.keys(data);
	dataKeys.sort(sortorder);
	var axisOffset = (bottomStart - gTop) / dataKeys.length;
	var yAxis = Number(gTop + axisOffset);
	var oldYAxis = gTop;
	var axisTolerance = Number(40 * scalefactor);
	var axisWidth = width - 170 * scalefactor;
	for (var key in dataKeys) {
		key = dataKeys[key];
		var values = data[key];
		// Axis
		horaxis(ctx, left, right, yAxis - axisTolerance, minXTick, maxXTick, xStep);
		vertaxis(ctx, oldYAxis, yAxis - axisTolerance, left - 10 * scalefactor, minYTick, maxYTick, yStep, undefined, false, false);
		ctx.save();
		ctx.fillStyle = '#000000';
		ctx.font = "bold " + 13 * scalefactor + "px Roboto";
		ctx.translate(40 * scalefactor, oldYAxis + ((axisOffset) / 2) - axisTolerance / 2);
		ctx.rotate(-Math.PI / 2);
		ctx.textAlign = "center";
		ctx.fillText("Frequency", 0, 0);
		ctx.restore();
		ctx.font = "bold " + 13 * scalefactor + "px Roboto";
		ctx.fillText(key, right + 50 * scalefactor, oldYAxis + ((axisOffset) / 2) - axisTolerance / 2);

		ctx.strokeStyle = '#000000';
		ctx.fillStyle = '#d3d3d3';

		xPoints = odata[key];
		var med = median(xPoints);
		var mean = calculatemean(xPoints);
		var num = xPoints.length;
		var sd = standarddeviation(xPoints);

		var valueKeys = Object.keys(values);
		for (var valueKey in valueKeys) {
			ctx.fillStyle = '#d3d3d3';
			var xBucket = parseFloat(valueKeys[valueKey]);
			var freq = values[xBucket];
			var x1 = (axisWidth * (xBucket - minXTick) / (maxXTick - minXTick)) + 90 * scalefactor;
			var x2 = (axisWidth * ((xBucket + xStep) - minXTick) / (maxXTick - minXTick)) + 90 * scalefactor;
			var w = x2 - x1;
			var div = 1;
			if (relativeFrequency) {
				div = num;
			}
			var y1 = convertvaltopixel(freq / div, minYTick, maxYTick, Number(yAxis - axisTolerance), oldYAxis);
			var h = (yAxis - axisTolerance) - y1;
			line(ctx, x1, y1, x2, y1);
			if (betterColours) {
				ctx.fillStyle = document.getElementById('primarycolour').value;
			}
			ctx.fillRect(x1, y1, w, h);
			ctx.strokeRect(x1, y1, w, h);
		}
		ctx.fillStyle = '#ed0000';
		ctx.font = 11 * scalefactor + "px Roboto";
		ctx.textAlign = "left";
		if ($('#regression').is(":checked") && $('#regshow').is(":visible")) {
			ctx.fillText("med:  " + med, 90 * scalefactor, oldYAxis);
			ctx.fillText("mean:  " + mean, 90 * scalefactor, oldYAxis + 10 * scalefactor);
			ctx.fillText("num:  " + num, 90 * scalefactor, oldYAxis + 20 * scalefactor);
			ctx.fillText("sd:  " + sd, 90 * scalefactor, oldYAxis + 30 * scalefactor);
		}

		oldYAxis = yAxis;
		yAxis += axisOffset;
	}

	labelgraph(ctx, width, height);

	if ($('#invert').is(":checked")) {
		invert(ctx);
	}

	return canvas.toDataURL();
}

function newbootstrap() {
	var canvas = document.getElementById('myCanvas');
	var ctx = canvas.getContext('2d');

	// set size
	var width = $('#width').val();
	var height = $('#height').val();
	ctx.canvas.width = width;
	ctx.canvas.height = height;

	ctx.fillStyle = '#ffffff';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// get points
	var xPoints = $('#xvar').val().split(',');
	xPoints.pop();

	var pointsRemoved = [];
	var points = [];
	for (var i in xPoints) {
		var xPoint = xPoints[i];
		if (!$.isNumeric(xPoint)) {
			xPoints.splice(i, 1);
			pointsRemoved += (i + 1) + ", ";
		} else {
			points.push(i);
		}
	}

	if (xPoints.length < 5) {
		return "Error: You must select a numerical x-variable with at least 5 datapoints.";
	}

	if (!$.isNumeric(xPoints[0])) {
		return 'Error: You must select a numerical x-variable.';
	}

	height = height / 2;

	ctx.fillStyle = '#000000';
	drawTitle(ctx, $('#title').val(), width / 2, 30 * scalefactor, 20);
	ctx.font = "bold " + 15 * scalefactor + "px Roboto";
	ctx.fillText($('#xaxis').val(), width / 2, height - 5 * scalefactor);

	var oYPixel = height - 60 * scalefactor;
	var left = 60 * scalefactor;
	var right = width - 60 * scalefactor;
	var maxheight = height - 120 * scalefactor;

	var alpha = 1 - $('#trans').val() / 100;
	var colours = makecolors(alpha, ctx);

	var minX = Math.min.apply(null, xPoints);
	var maxX = Math.max.apply(null, xPoints);

	var minMaxSteps = axisminmaxstep(minX, maxX);
	var minXTick = minMaxSteps[0];
	var maxXTick = minMaxSteps[1];
	var xStep = minMaxSteps[2];
	if (minX == minXTick) {
		minXTick -= xStep;
	}
	if (maxX == maxXTick) {
		maxXTick += xStep;
	}

	var btype = $('#btype').val();

	// Dot plot
	horaxis(ctx, left, right, add(oYPixel, 10 * scalefactor), minXTick, maxXTick, xStep);
	plotdotplot(ctx, points, xPoints, minXTick, maxXTick, oYPixel, left, right, maxheight, colours, 2, 1, true, btype);
	ctx.fillStyle = '#000';

	height = height * 2;
	var title = "Bootstrap - ";
	title += btype;

	drawTitle(ctx, title, width / 2, height - 10 * scalefactor, 20);
	// Actual bootstrap
	var bootstrapValues = [];
	var num = xPoints.length;
	var b = 0;
	while (b < 1000) {
		var i = 0;
		var bootstrapSample = [];
		while (i < num) {
			var select = randint(0, num - 1);
			bootstrapSample.push(Number(xPoints[select]));
			i++;
		}
		var value = 0;
		if (btype == 'Mean') {
			value = array_sum(bootstrapSample) / bootstrapSample.length;
		}
		if (btype == 'Median') {
			value = median(bootstrapSample);
		}
		if (btype == 'IQR') {
			value = upperquartile(bootstrapSample) - lowerquartile(bootstrapSample);
		}
		if (btype == 'Standard Deviation') {
			value = standarddeviation(bootstrapSample);
		}
		bootstrapValues.push(value);
		b++;
	}

	var offset = 0;
	if (btype == 'IQR' || btype == 'Standard Deviation') {
		offset = -(minXTick + maxXTick) / 2 + array_sum(bootstrapValues) / bootstrapValues.length;
	}
	offset = Math.floor(offset / xStep);
	offset = xStep * offset;
	minXTick = minXTick + offset;
	maxXTick = maxXTick + offset;

	horaxis(ctx, left, right, height - 50 * scalefactor, minXTick, maxXTick, xStep);

	var pSize = $('#size').val() / 2 * scalefactor;

	var xPixels = [];
	for (var i in bootstrapValues) {
		var xValue = bootstrapValues[i];
		var xPixel = Math.round(((width - 120) * (xValue - minXTick) / (maxXTick - minXTick)) / (pSize / 2)) * pSize / 2 + 60;
		xPixels.push(xPixel);
	}
	xPixels.sort();

	var lastXPixel = -10000;
	var count = array_count_values(xPixels);
	var keys = Object.keys(count);
	var max = count[keys[0]];
	for (var k in keys) {
		var key = keys[k];
		if (count[key] > max) {
			max = count[key];
		}
	}
	var yHeight = (height * 0.5 - 100 * scalefactor) / max;
	if (yHeight > pSize) {
		yHeight = pSize;
	}
	var yPixel = 0;
	ctx.fillStyle = '#999999';
	ctx.lineWidth = 2 * scalefactor;
	for (var i in xPixels) {
		var xPixel = xPixels[i];
		if (lastXPixel == xPixel) {
			yPixel = yPixel - yHeight;
		} else {
			yPixel = height - 90 * scalefactor;
		}
		lastXPixel = xPixel;
		if (i == 25) {
			ctx.fillStyle = '#636363';
		}
		if (i == 975) {
			ctx.fillStyle = '#999999';
		}
		ctx.beginPath();
		ctx.arc(xPixel, yPixel, pSize, 0, 2 * Math.PI);
		ctx.fill();
	}
	var mean = calculatemean(xPoints);
	var med = median(xPoints);
	var lq = lowerquartile(xPoints);
	var uq = upperquartile(xPoints);
	var sd = parseFloat(standarddeviation(xPoints));

	var x = 0;
	var val = 0;
	if (btype == 'Mean') {
		x = (width - 120) * (mean - minXTick) / (maxXTick - minXTick) + 60;
		val = mean.toPrecision(4);
	}
	if (btype == 'Median') {
		x = (width - 120) * (med - minXTick) / (maxXTick - minXTick) + 60;
		val = med.toPrecision(4);
	}
	if (btype == 'IQR') {
		x = (width - 120) * ((uq - lq) - minXTick) / (maxXTick - minXTick) + 60;
		val = (uq - lq).toPrecision(4);
	}
	if (btype == 'Standard Deviation') {
		x = (width - 120) * (sd - minXTick) / (maxXTick - minXTick) + 60;
		val = sd.toPrecision(4);
	}

	ctx.strokeStyle = 'rgb(255,0,0)';
	line(ctx, x, height * 0.5, x, height - 80);

	var min = Number(bootstrapValues[25]);
	var minXPixel = Math.round(((width - 120) * (min - minXTick) / (maxXTick - minXTick))) + 60;
	ctx.strokeStyle = 'rgb(0, 0, 255)';
	line(ctx, minXPixel, height - 65, minXPixel, height - 120);
	var max = Number(bootstrapValues[975]);
	var maxXPixel = Math.round(((width - 120) * (max - minXTick) / (maxXTick - minXTick))) + 60;
	line(ctx, maxXPixel, height - 75, maxXPixel, height - 120);

	ctx.lineWidth = 8 * scalefactor;
	line(ctx, minXPixel, height - 115, maxXPixel, height - 115);

	ctx.textAlign = "center";
	min = min.toPrecision(4);
	max = max.toPrecision(4);
	ctx.fillStyle = 'rgb(0, 0, 255)';
	ctx.fillText(min, minXPixel, height - 55);
	ctx.fillText(max, maxXPixel, height - 65);
	ctx.fillStyle = 'rgb(255, 0, 0)';
	ctx.textAlign = "left";
	ctx.fillText(val, x + 3, height * 0.5 + 5);

	if (pointsRemoved > 22) {
		ctx.fillStyle = '#000000';
		ctx.font = 13 * scalefactor + "px Roboto";
		ctx.textAlign = "right";
		ctx.fillText("ID(s) of Points Removed: " + pointsRemoved.join(", "), width - 40 * scalefactor, 40 * scalefactor);
	}

	labelgraph(ctx, width, height);

	if ($('#invert').is(":checked")) {
		invert(ctx);
	}

	return canvas.toDataURL();
}

function newpairedexperimentdotplot() {
	var canvas = document.getElementById('myCanvas');
	var ctx = canvas.getContext('2d');

	//set size
	var width = $('#width').val();
	var height = $('#height').val();
	ctx.canvas.width = width;
	ctx.canvas.height = height;

	ctx.fillStyle = '#ffffff';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.fillStyle = '#000000';
	ctx.textAlign = "center";

	// get points
	var xPoints = $('#xvar').val().split(',');
	xPoints.pop();
	var yPoints = $('#yvar').val().split(',');
	yPoints.pop();

	if (xPoints.length == 0 || !$.isNumeric(xPoints[0])) {
		return "Error: You must select a numerical x-variable.";
	}

	if (yPoints.length == 0 || !$.isNumeric(yPoints[0])) {
		return "Error: You must select a numerical y-variable.";
	}

	var numX = xPoints.length;
	var xLabel = $('#xaxis').val();
	var yLabel = $('#yaxis').val();
	var titles = [xLabel, yLabel];
	var dir = "az";
	if (titles[0] != xLabel) {
		dir = "za";
	}
	var oXPoints = xPoints.slice();
	var oYPoints = yPoints.slice();
	var xPoints = xPoints.concat(yPoints);

	var i = 0;
	for (var xpoint in xPoints) {
		if (i < numX) {
			yPoints[i] = xLabel;
		} else {
			yPoints[i] = yLabel;
		}
		i++;
	}

	var numSubSets = 1;
	var diffPoints = [];
	var i = 0;
	for (var index in oXPoints) {
		var diff = add(-oXPoints[index], oYPoints[i]);
		diffPoints[i] = diff;
		i++;
	}

	if (!($('#arrows').is(":checked"))) {
		var title = "Difference (" + yLabel + " - " + xLabel + ")";
		drawTitle(ctx, title, width / 2, height - 10 * scalefactor, 20);
		xPoints = diffPoints;
		yPoints = [];
		i = 0;
		for (var xPoint in xPoints) {
			yPoints[i] = "";
			i++;
		}
	}

	var oYPixel = height - 60 * scalefactor;
	var left = 120 * scalefactor;
	var right = width - 60 * scalefactor;
	var maxheight = height - 180 * scalefactor;

	var pSize = $('#size').val() / 2 * scalefactor;

	var alpha = 1 - $('#trans').val() / 100;
	var colours = makecolors(alpha, ctx);

	var numCategories = Math.max(array_unique(yPoints).length, 1);
	var minX = Math.min.apply(null, xPoints);
	var maxX = Math.max.apply(null, xPoints);

	var XaxisMinMaxSteps = axisminmaxstep(minX, maxX);
	var minXTick = XaxisMinMaxSteps[0];
	var maxXTick = XaxisMinMaxSteps[1];
	var xStep = XaxisMinMaxSteps[2];

	horaxis(ctx, left, right, height - 50 * scalefactor, minXTick, maxXTick, xStep);

	i = 0;
	var subsets = [];
	xPoints.forEach(function (xpoint) {
		var subset = " ";
		i++;
		if (subsets.hasOwnProperty(subset)) {
			subsets[subset].push([xpoint, yPoints[i - 1], i]);
		} else {
			subsets[subset] = [[xpoint, yPoints[i - 1], i]];
		}
	});

	var keys = Object.keys(subsets);
	var numsubsets = keys.length;
	keys.sort();

	var catNames = array_unique(yPoints);
	if (dir == "az") {
		catNames.sort();
	} else {
		catNames.sort();
		catNames.reverse();
	}

	var offset = 50 * scalefactor;
	for (var key in keys) {
		key = keys[key];

		var xPoints = [];
		var yPoints = [];
		var labels = [];
		subsets[key].forEach(function (xvals) {
			xPoints.push(xvals[0]);
			yPoints.push(xvals[1]);
			labels.push(xvals[2]);
		});

		i = 0;
		var categories = [];
		xPoints.forEach(function (xPoint) {
			var category = " ";
			if (yPoints.length != 0) {
				category = yPoints[i];
			}
			i++;
			if (categories.hasOwnProperty(category)) {
				categories[category].push([xPoint, labels[i - 1]]);
			} else {
				categories[category] = [[xPoint, labels[i - 1]]];
			}
		});

		var subHeight = Math.max((height - 100), 1);
		var subWidth = Math.max((width - 100) / numsubsets, 1);

		ctx.textAlign = "center";
		ctx.fillStyle = '#000';
		ctx.font = "bold " + 15 * scalefactor + "px Roboto";
		ctx.fillText(key, (subWidth / 2) + 30,
			(subHeight + 10) + offset);

		var imheight = (subHeight - 20) / numCategories;
		if (dir == "az") {
			categories.sort();
		} else {
			categories.sort();
			categories.reverse();
		}

		var catKeys = Object.keys(categories);
		catKeys.forEach(function (category) {
			xPoints = [];
			labels = [];
			categories[category].forEach(function (xVals) {
				xPoints.push(xVals[0]);
				labels.push(xVals[1]);
			});
			imheight = (subHeight - 20) / numCategories;
			ctx.textAlign = "center";
			ctx.fillStyle = '#000';
			ctx.font = "bold " + 15 * scalefactor + "px Roboto";
			ctx.fillText(category, subWidth, (imheight * 0.4) + offset);

			var min = Math.min.apply(null, xPoints);
			var minGraph = convertvaltopixel(min, minXTick, maxXTick, left, right);
			minGraph = Math.floor(minGraph / ((pSize / 2) * 3)) * (pSize / 2) * 3;
			var lq = lowerquartile(xPoints);
			var lqGraph = convertvaltopixel(lq, minXTick, maxXTick, left, right);
			lqGraph = Math.floor(lqGraph / ((pSize / 2) * 3)) * (pSize / 2) * 3;
			var med = median(xPoints);
			var medGraph = convertvaltopixel(med, minXTick, maxXTick, left, right);
			medGraph = Math.floor(medGraph / ((pSize / 2) * 3)) * (pSize / 2) * 3;
			var mean = calculatemean(xPoints);
			var meanGraph = convertvaltopixel(mean, minXTick, maxXTick, left, right);
			meanGraph = Math.floor(meanGraph / ((pSize / 2) * 3)) * (pSize / 2) * 3;
			var uq = upperquartile(xPoints);
			var uqGraph = convertvaltopixel(uq, minXTick, maxXTick, left, right);
			uqGraph = Math.floor(uqGraph / ((pSize / 2) * 3)) * (pSize / 2) * 3;
			var max = Math.max.apply(null, xPoints);
			var maxGraph = convertvaltopixel(max, minXTick, max, left, right);
			maxGraph = Math.floor(maxGraph / ((pSize / 2) * 3)) * (pSize / 2) * 3;
			var sd = standarddeviation(xPoints);
			var num = xPoints.length;
			var y = height - 105 * scalefactor;
			var h = 46 * scalefactor;
			var intmin = med - 1.5 * (uq - lq) / Math.sqrt(num);
			var intminGraph = convertvaltopixel(intmin, minXTick, maxXTick, left, right);
			intminGraph = Math.floor(intminGraph / ((pSize / 2) * 3)) * (pSize / 2) * 3;
			var intmax = med + 1.5 * (uq - lq) / Math.sqrt(num);
			var intmaxGraph = convertvaltopixel(intmax, minXTick, maxXTick, left, right);
			intmaxGraph = Math.floor(intmaxGraph / ((pSize / 2) * 3)) * (pSize / 2) * 3;
			var top = imheight * 0.7 - 39 + offset;

			if ($('#regression').is(":checked")) {
				ctx.fillStyle = 'rgb(255, 0, 0)';
				ctx.font = 11 * scalefactor + "px Roboto";
				ctx.textAlign = "left";
				ctx.fillText("min: " + min, left - 60, top + 8);
				ctx.fillText("LQ: " + lq, left - 60, top + 18);
				ctx.fillText("med: " + med, left - 60, top + 28);
				ctx.fillText("mean: " + mean, left - 60, top + 38);
				ctx.fillText("UQ: " + uq, left - 60, top + 48);
				ctx.fillText("max: " + max, left - 60, top + 58);
				ctx.fillText("sd: " + sd, left - 60, top + 68);
				ctx.fillText("num: " + num, left - 60, top + 78);
			}
			ctx.fillStyle = "#000";
			if (!$("#arrows").is(":checked")) {
				var xPixels = [];
				var xLabels = [];

				i = 0;
				while (i < xPoints.length) {
					var xValue = xPoints[i];
					var xPixel = convertvaltopixel(xValue, minXTick, maxXTick, left, right);
					xPixel = Math.floor(xPixel / ((pSize / 2) * 3)) * (pSize / 2) * 3;
					xPixels.push(xPixel);
					xLabels.push(labels[i]);
					i++;
				}

				i = 0;
				var count = array_count_values(xPixels);
				var keys = Object.keys(count);
				var max = count[keys[0]];
				for (var key in keys) {
					key = keys[key];
					if (count[key] > max) {
						max = count[key];
					}
				}
				var yHeight = (height * 0.5 - (100 * scalefactor)) / max;
				if (yHeight > pSize) {
					yHeight = pSize;
				}
				array_multisort(xPixels, xLabels);
				ctx.lineWidth = 2 * scalefactor;
				ctx.strokeStyle = '#999999';
				var yPixel = 0;
				var lastXPixel = -100000;
				for (var i in xPixels) {
					var xPixel = xPixels[i];
					if (lastXPixel == xPixel) {
						yPixel = yPixel - yHeight - 1;
					} else {
						yPixel = height - 115 * scalefactor;
					}
					lastXPixel = xPixel;
					ctx.strokeStyle = colours[i];
					ctx.beginPath();
					ctx.arc(xPixel, yPixel, pSize / 2, 0, 2 * Math.PI);
					ctx.stroke();
					if ($('#labels').is(":checked")) {
						var print = xLabels[i];
						if (print > numX) {
							print = print - numX;
						}
						ctx.fillStyle = "rgb(0, 0, 255)";
						ctx.font = 8 * scalefactor + "px Roboto";
						ctx.fillText(print, xPixel + 3, yPixel + 3);
					}
				}
				if ($('#boxplot').is(":checked")) {
					ctx.lineWidth = 1 * scalefactor;
					ctx.fillStyle = "#000";
					ctx.strokeStyle = "#000";
					line(ctx, minGraph, y - 5 * scalefactor, minGraph, y + 5 * scalefactor);
					line(ctx, lqGraph, y - h, lqGraph, y + h);
					line(ctx, medGraph, y - h, medGraph, y + h);
					line(ctx, uqGraph, y - h, uqGraph, y + h);
					line(ctx, maxGraph, y - 5 * scalefactor, maxGraph, y + 5 * scalefactor);
					line(ctx, minGraph, y, lqGraph, y);
					line(ctx, lqGraph, y + h, uqGraph, y + h);
					line(ctx, lqGraph, y - h, uqGraph, y - h);
					line(ctx, uqGraph, y, maxGraph, y);
				}
				if ($('#interval').is(":checked")) {
					ctx.lineWidth = 8 * scalefactor;
					ctx.strokeStyle = "rgb(0, 0, 255)";
					line(ctx, intminGraph, y, intmaxGraph, y);
					ctx.strokeStyle = "#000";
					ctx.lineWidth = 1 * scalefactor;
				}
				if ($('#intervallim').is(":checked")) {
					ctx.textAlign = "right";
					ctx.fillStyle = "rgb(0, 0, 255)";
					intmin = intmin.toPrecision(5);
					intmax = intmax.toPrecision(5);
					ctx.fillText(intmin, intminGraph, y + 14);
					ctx.textAlign = "left";
					ctx.fillText(intmax, intmaxGraph, y + 14);
					ctx.fillStyle = "#000";
					ctx.textAlign = "center";
				}
			}
			offset += height / 3;
		});
	}

	if ($("#arrows").is(":checked")) {
		i = 0;
		ctx.strokeStyle = "#828282";
		ctx.fillStyle = "#828282";
		oXPoints.forEach(function (xValue) {
			var yValue = oYPoints[i];
			var t = height * 0.3;
			var b = height * 0.8;
			var xPix = convertvaltopixel(xValue, minXTick, maxXTick, left, right);
			var yPix = convertvaltopixel(yValue, minXTick, maxXTick, left, right);
			ctx.beginPath();
			ctx.ellipse(xPix, t - 5, pSize, pSize, 0, 0, 2 * Math.PI);
			ctx.fill();
			ctx.beginPath();
			ctx.ellipse(yPix, b + 5, pSize, pSize, 0, 0, 2 * Math.PI);
			ctx.fill();
			ctx.fillStyle = colours[i];
			ctx.strokeStyle = colours[i];
			arrow(ctx, xPix, t, yPix, b, 5, 3);
			ctx.strokeStyle = "#828282";
			ctx.fillStyle = "#828282";
			i++;
		});
	}

	drawTitle(ctx, $('#title').val(), width / 2, 30 * scalefactor, 20);

	labelgraph(ctx, width, height);

	if ($('#invert').is(":checked")) {
		invert(ctx);
	}

	return canvas.toDataURL();
}

function newhistogramf() {
	var canvas = document.getElementById('myCanvas');
	var ctx = canvas.getContext('2d');

	//set size
	var width = $('#width').val();
	var height = $('#height').val();
	ctx.canvas.width = width;
	ctx.canvas.height = height;

	ctx.fillStyle = '#ffffff';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	var relativeFrequency = false;
	if ($('#relativefrequency').is(":checked")) {
		relativeFrequency = true;
	}
	var betterColours = false;
	if ($('#bettercolours').is(":checked") && $('#bettercoloursshow').is(":visible")) {
		betterColours = true;
	}

	// get points
	var xPoints = $('#xvar').val().split(',');
	xPoints.pop();
	var yPoints = $('#yvar').val().split(',');
	yPoints.pop();
	var zPoints = $('#zvar').val().split(',');
	zPoints.pop();

	var i = 0;
	var pointsRemoved = [];
	xPoints.forEach(function (xPoint) {
		if (!$.isNumeric(xPoint)) {
			xPoints.splice(i, 1);
			yPoints.splice(i, 1);
			zPoints.splice(i, 1);
			pointsRemoved += (i + 1) + ", ";
		}
		i++;
	});

	if (xPoints.length == 0 || !$.isNumeric(xPoints[0])) {
		return "Error: You must select a numerical variable for variable 1";
	}
	if (yPoints.length == 0 || !$.isNumeric(yPoints[0])) {
		return "Error: you must select a numerical variable for variable 2";
	}

	var newXPoints = [];
	for (var key in xPoints) {
		var value = xPoints[key];
		i = 0;
		while (i < yPoints[key]) {
			newXPoints.push(value);
			i++;
		}
	}

	var numCategories = array_unique(zPoints).length;
	if (numCategories > 5 && $.isNumeric(zPoints[0])) {
		var min = Math.min.apply(null, zPoints);
		var max = Math.max.apply(null, zPoints);
		var range = max - min;
		i = 0;
		var c1max = parseFloat(Number(min + range / 4).toPrecision(2));
		var c2max = parseFloat(Number(c1max + range / 4).toPrecision(2));
		var c3max = parseFloat(Number(c2max + range / 4).toPrecision(2));
		zPoints.forEach(function (zPoint) {
			if (zPoint < c1max) {
				zPoints[i] = "a: < " + c1max;
			} else if (value < c2max) {
				zPoints[i] = "b: " + c1max + " - " + c2max;
			} else if (value < c3max) {
				zPoints[i] = "c: " + (c2max + " - " + c3max);
			} else {
				zPoints[i] = "d: > " + c3max;
			}
			i++;
		});
		numCategories = 4;
	}
	if (numCategories > 5) {
		return "Error: You must select a categorical variable for variable 3 with 4 or fewer categories or a numerical variable for variable 3 which will automatically be split into 4 categories.";
	}
	if (numCategories == 0) {
		numCategories = 1;
		for (var key in xPoints) {
			zPoints[key] = " ";
		}
	}

	ctx.textAlign = "center";
	ctx.fillStyle = '#000000';
	drawTitle(ctx, $('#title').val(), width / 2, 30 * scalefactor, 20);

	ctx.font = "bold " + 15 * scalefactor + "px Roboto";
	ctx.fillText($('#xaxis').val(), width / 2, height - 10 * scalefactor);
	ctx.save();
	ctx.translate(20 * scalefactor, height / 2);
	ctx.rotate(-Math.PI / 2);
	ctx.fillText($('#yaxis').val(), 0, 0);
	ctx.restore();

	// Calculate minX and maxX by looping the array, because it can be too large to process
	var minX = newXPoints[0];
	var maxX = newXPoints[0];
	for (var index in newXPoints) {
		var value = newXPoints[index];
		if (value < minX) {
			minX = value;
		}
		if (value > maxX) {
			maxX = value;
		}
	}
	var minMaxSteps = axisminmaxstep(minX, maxX);
	var minXTick = minMaxSteps[0];
	var maxXTick = minMaxSteps[1] + minMaxSteps[2];
	var xStep = minMaxSteps[2];

	var left = 90 * scalefactor;
	var right = width - 80 * scalefactor;
	var gTop = 60 * scalefactor;
	var bottom = height - 60 * scalefactor;

	i = 0;
	var data = [];
	var oData = [];
	xPoints.forEach(function (xPoint) {
		var zPoint = zPoints[i];
		var xBucket = Math.floor(xPoint / xStep) * xStep;
		if (!(zPoint in data)) {
			data[zPoint] = [];
		}
		if (!(zPoint in oData)) {
			oData[zPoint] = [];
		}
		var w = 0;
		while (w < yPoints[i]) {
			data[zPoint].push(xBucket);
			oData[zPoint].push(xPoint);
			w++;
		}
		i++;
	});

	var sum = 1;
	var maxFreq = [];
	for (var category in data) {
		data[category] = array_count_values(data[category]);
		var keys = Object.keys(data[category]);

		var max = data[category][keys[0]];
		for (var key in keys) {
			key = keys[key];
			if (data[category][key] > max) {
				max = data[category][key];
			}
		}
		if (relativeFrequency) {
			sum = array_sum(data[category]);
		}
		maxFreq.push(max / sum);
	}

	maxFreq = Math.max.apply(null, maxFreq);
	numCategories = Object.keys(data).length;

	var minY = 0.0001;
	var maxY = maxFreq;
	minMaxSteps = axisminmaxstep(minY, maxY);
	var minYTick = minMaxSteps[0];
	var maxYTick = minMaxSteps[1];
	var yStep = minMaxSteps[2];

	var dataKeys = Object.keys(data);
	dataKeys.sort(sortorder);
	var bottomStart = bottom + 30 * scalefactor;
	var axisOffset = (bottomStart - gTop) / dataKeys.length;
	var yAxis = Number(gTop + axisOffset);
	var oldYAxis = gTop;
	var axisTolerance = Number(40 * scalefactor);
	var axisWidth = width - 170 * scalefactor;
	for (var category in dataKeys) {
		category = dataKeys[category];
		var values = data[category];
		i = 0;
		horaxis(ctx, left, right, yAxis - axisTolerance, minXTick, maxXTick, xStep);
		vertaxis(ctx, oldYAxis, yAxis - axisTolerance, left - 10 * scalefactor, minYTick, maxYTick, yStep, undefined, false, false);
		ctx.textAlign = "center";
		ctx.fillStyle = '#000000';
		ctx.font = "bold " + 13 * scalefactor + "px Roboto";
		ctx.save();
		ctx.translate(40 * scalefactor, oldYAxis + ((axisOffset) / 2) - axisTolerance / 2);
		ctx.rotate(-Math.PI / 2);
		ctx.fillText("Frequency", 0, 0);
		ctx.restore();
		ctx.fillText(category, right + 50 * scalefactor, oldYAxis + ((axisOffset) / 2) - axisTolerance / 2);

		ctx.strokeStyle = '#000000';
		ctx.fillStyle = '#d3d3d3';

		xPoints = oData[category];
		var med = median(xPoints);
		var mean = calculatemean(xPoints);
		var num = xPoints.length;
		var sd = standarddeviation(xPoints);

		var valueKeys = Object.keys(values);
		for (var valueKey in valueKeys) {
			ctx.fillStyle = '#d3d3d3';
			var xBucket = parseFloat(valueKeys[valueKey]);
			var freq = values[xBucket];
			var x1 = (axisWidth * (xBucket - minXTick) / (maxXTick - minXTick)) + 90 * scalefactor;
			var x2 = (axisWidth * ((xBucket + xStep) - minXTick) / (maxXTick - minXTick)) + 90 * scalefactor;
			var w = x2 - x1;
			var div = 1;
			if (relativeFrequency) {
				div = num;
			}
			var y1 = convertvaltopixel(freq / div, minYTick, maxYTick, Number(yAxis - axisTolerance), oldYAxis);
			var h = (yAxis - axisTolerance) - y1;
			line(ctx, x1, y1, x2, y1);
			if (betterColours) {
				ctx.fillStyle = document.getElementById('primarycolour').value;
			}
			ctx.fillRect(x1, y1, w, h);
			ctx.strokeRect(x1, y1, w, h);
		}
		ctx.fillStyle = '#ed0000';
		ctx.font = 11 * scalefactor + "px Roboto";
		ctx.textAlign = "left";
		if ($('#regression').is(":checked") && $('#regshow').is(":visible")) {
			ctx.fillText("med:  " + med, 90 * scalefactor, oldYAxis);
			ctx.fillText("mean:  " + mean, 90 * scalefactor, oldYAxis + 10 * scalefactor);
			ctx.fillText("num:  " + num, 90 * scalefactor, oldYAxis + 20 * scalefactor);
			ctx.fillText("sd:  " + sd, 90 * scalefactor, oldYAxis + 30 * scalefactor);
		}

		oldYAxis = yAxis;
		yAxis += axisOffset;
	}

	labelgraph(ctx, width, height);

	if ($('#invert').is(":checked")) {
		invert(ctx);
	}

	return canvas.toDataURL();
}

function newrerandomisationmedian() {
	return rerandomisation("median");
}

function newrerandomisationmean() {
	return rerandomisation("mean");
}

function rerandomisation(type) {
	var isMedian = (type == "median");
	var canvas = document.getElementById('myCanvas');
	var ctx = canvas.getContext('2d');

	//set size
	var width = $('#width').val();
	var height = $('#height').val();
	ctx.canvas.width = width;
	ctx.canvas.height = height;

	ctx.fillStyle = '#ffffff';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	var pSize = $('#size').val() / 2 * scalefactor;
	var alpha = 1 - $('#trans').val() / 100;
	var colours = makecolors(alpha, ctx);

	// get points
	var xOPoints = $('#xvar').val().split(',');
	xOPoints.pop();
	var yPoints = $('#yvar').val().split(',');
	yPoints.pop();

	var i = 0;
	var pointsRemoved = [];
	var pointLabels = [];
	xOPoints.forEach(function (xPoint) {
		pointLabels.push(i + 1);
		if (!$.isNumeric(xPoint)) {
			xOPoints.splice(i, 1);
			yPoints.splice(i, 1);
			pointLabels.splice(i, 1);
			pointsRemoved += (i + 1) + ", ";
		}
		i++;
	});

	if (xOPoints.length == 0 || !$.isNumeric(xOPoints[0])) {
		return "Error: You must select a numerical x-variable.";
	}
	var numCategories = array_unique(yPoints).length;
	if (numCategories != 2) {
		return "Error: You must select a categorical y-variable with 2 categories.";
	}

	ctx.textAlign = "center";
	ctx.fillStyle = "#000000";
	drawTitle(ctx, $('#title').val(), width / 2, 30 * scalefactor, 20);

	height /= 2;
	ctx.font = "bold " + 15 * scalefactor + "px Roboto";
	ctx.fillText($('#xaxis').val(), width / 2, height - 5 * scalefactor);
	ctx.save();
	ctx.translate(20 * scalefactor, height / 2);
	ctx.rotate(-Math.PI / 2);
	ctx.fillText($('#yaxis').val(), 0, 0);
	ctx.restore();

	var i = 0;
	var categories = [];
	xOPoints.forEach(function (xPoint) {
		var category = " ";
		if (yPoints.length != 1) {
			category = yPoints[i];
		}
		i++;
		if (categories.hasOwnProperty(category)) {
			categories[category].push([xPoint, i]);
		} else {
			categories[category] = [[xPoint, i]];
		}
	});
	i = 0;
	var medOrMeans = [];
	categories.forEach(function (values) {
		var points = [];
		values.forEach(function (value) {
			points.push(value[0]);
		});
		// TODO: Come back to this, both functions use median but call them different things?
		var med = median(points);
		medOrMeans.push(med);
		i++;
	});

	var differ = Math.max.apply(null, medOrMeans) - Math.min.apply(null, medOrMeans);
	var minX = Math.min.apply(null, xOPoints);
	var maxX = Math.max.apply(null, xOPoints);
	var axisMinMaxSteps = axisminmaxstep(minX, maxX, differ);
	var minXTick = axisMinMaxSteps[0];
	var maxXTick = axisMinMaxSteps[1] + axisMinMaxSteps[2];
	var xStep = axisMinMaxSteps[2];

	var left = 90 * scalefactor;
	var right = width - 80 * scalefactor;
	var gTop = 60 * scalefactor;
	var bottom = height - 60 * scalefactor;

	horaxis(ctx, left, right, height - 50 * scalefactor, minXTick, maxXTick, xStep);

	var subHeight = Math.max((height - 100), 1);
	var subWidth = Math.max((width - 100), 1);
	var imheight = (subHeight - 20) / numCategories;

	var offset = 30 * scalefactor;
	var yOffset = 0;
	var medians = [];
	var cnames = [];
	var keys = Object.keys(categories);
	var medians = [];
	keys.sort(sortorder);
	var tCount = 1;
	var oyPixel = height / 5;
	keys.forEach(function (category) {
		var value = categories[category];
		cnames.push(category);

		var xPoints = [];
		var labels = [];
		categories[category].forEach(function (xVals) {
			xPoints.push(xVals[0]);
			labels.push(xVals[1]);
		});

		ctx.textAlign = "center";
		ctx.fillStyle = "#000000";
		ctx.font = "bold " + 15 * scalefactor + "px Roboto";
		ctx.fillText(category, subWidth, (imheight * 0.8) + offset);

		var min = Math.min.apply(null, xPoints);
		var minGraph = convertvaltopixel(min, minXTick, maxXTick, left, right);
		var min = Math.min.apply(null, xPoints);
		var minGraph = convertvaltopixel(min, minXTick, maxXTick, left, right);
		minGraph = Math.floor(minGraph / ((pSize / 2) * 3)) * (pSize / 2) * 3;
		var lq = lowerquartile(xPoints);
		var lqGraph = convertvaltopixel(lq, minXTick, maxXTick, left, right);
		lqGraph = Math.floor(lqGraph / ((pSize / 2) * 3)) * (pSize / 2) * 3;
		var med = median(xPoints);
		medians.push(med);
		var medGraph = convertvaltopixel(med, minXTick, maxXTick, left, right);
		medGraph = Math.floor(medGraph / ((pSize / 2) * 3)) * (pSize / 2) * 3;
		var mean = calculatemean(xPoints);
		var meanGraph = convertvaltopixel(mean, minXTick, maxXTick, left, right);
		meanGraph = Math.floor(meanGraph / ((pSize / 2) * 3)) * (pSize / 2) * 3;
		var uq = upperquartile(xPoints);
		var uqGraph = convertvaltopixel(uq, minXTick, maxXTick, left, right);
		uqGraph = Math.floor(uqGraph / ((pSize / 2) * 3)) * (pSize / 2) * 3;
		var max = Math.max.apply(null, xPoints);
		var maxGraph = convertvaltopixel(max, minXTick, maxXTick, left, right);
		maxGraph = Math.floor(maxGraph / ((pSize / 2) * 3)) * (pSize / 2) * 3;
		var sd = standarddeviation(xPoints);
		var num = xPoints.length;
		var y = height - 105 * scalefactor;
		var h = 46 * scalefactor;
		var top = offset;

		if ($('#regression').is(":checked")) {
			top = ((height / 3) * tCount) - 70 * scalefactor;
			ctx.fillStyle = 'rgb(255, 0, 0)';
			ctx.font = 11 * scalefactor + "px Roboto";
			ctx.textAlign = "left";
			ctx.fillText("min: " + min, left - 60, top + 8);
			ctx.fillText("LQ: " + lq, left - 60, top + 18);
			ctx.fillText("med: " + med, left - 60, top + 28);
			ctx.fillText("mean: " + mean, left - 60, top + 38);
			ctx.fillText("UQ: " + uq, left - 60, top + 48);
			ctx.fillText("max: " + max, left - 60, top + 58);
			ctx.fillText("sd: " + sd, left - 60, top + 68);
			ctx.fillText("num: " + num, left - 60, top + 78);
		}
		ctx.fillStyle = '#000000';
		var xPixels = [];
		var xLabels = [];
		i = 0;
		while (i < xPoints.length) {
			var xValue = xPoints[i];
			var xPixel = convertvaltopixel(xValue, minXTick, maxXTick, left, right);
			xPixel = Math.floor(xPixel / ((pSize) * 3)) * (pSize) * 3;
			xPixels.push(xPixel);
			xLabels.push(labels[i]);
			i++;
		}
		array_multisort(xPixels, xLabels);
		i = 0;
		var count = array_count_values(xPixels);
		var keys = Object.keys(count);
		var max = count[keys[0]];
		for (var key in keys) {
			key = keys[key];
			if (count[key] > max) {
				max = count[key];
			}
		}
		var yHeight = (height * 0.5 - (100 * scalefactor)) / max;
		if (yHeight > pSize) {
			yHeight = pSize * 2;
		}
		ctx.lineWidth = 2 * scalefactor;
		ctx.strokeStyle = '#999999';
		var yPixel = 0;
		var lastXPixel = -100000;
		if (tCount == 1) {
			oyPixel /= 2;
			oyPixel += height / 4;
		} else {
			oyPixel *= 2;
		}
		xPixels.forEach(function (xPixel) {
			if (lastXPixel == xPixel) {
				yPixel = yPixel - yHeight - 1;
			} else {
				yPixel = oyPixel;
			}
			lastXPixel = xPixel;
			ctx.strokeStyle = colours[i];
			ctx.beginPath();
			ctx.arc(xPixel, yPixel, pSize, 0, 2 * Math.PI);
			ctx.stroke();
			if ($('#labels').is(":checked")) {
				var print = xLabels[i];
				ctx.fillStyle = "rgb(0, 0, 255)";
				ctx.font = 8 * scalefactor + "px Roboto";
				ctx.textAlign = "left";
				ctx.fillText(print, xPixel + 5, yPixel + 3);
			}
		});
		ctx.textAlign = "center";

		if (type == 'median') {
			// Box plot
			ctx.lineWidth = 1 * scalefactor;
			ctx.fillStyle = '#000000';
			ctx.strokeStyle = '#000000';
			line(ctx, minGraph, oyPixel - 10 * scalefactor, minGraph, oyPixel + 10 * scalefactor);
			line(ctx, lqGraph, oyPixel - 10 * scalefactor, lqGraph, oyPixel + 10 * scalefactor);
			line(ctx, medGraph, oyPixel - 10 * scalefactor, medGraph, oyPixel + 10 * scalefactor);
			line(ctx, uqGraph, oyPixel - 10 * scalefactor, uqGraph, oyPixel + 10 * scalefactor);
			line(ctx, maxGraph, oyPixel - 10 * scalefactor, maxGraph, oyPixel + 10 * scalefactor);
			line(ctx, minGraph, oyPixel, lqGraph, oyPixel);
			line(ctx, lqGraph, oyPixel + 10 * scalefactor, uqGraph, oyPixel + 10 * scalefactor);
			line(ctx, lqGraph, oyPixel - 10 * scalefactor, uqGraph, oyPixel - 10 * scalefactor);
			line(ctx, uqGraph, oyPixel, maxGraph, oyPixel);
		} else if (type == 'mean') {
			// Mean dot
			ctx.fillStyle = "rgb(255, 0, 0)";
			ctx.beginPath();
			ctx.arc(meanGraph, oyPixel, pSize, 0, 2 * Math.PI);
			ctx.fill();
		}

		offset += height / 3;
		tCount++;
	});
	height *= 2;


	var diff = medians[0] - medians[1];
	var arrow = 5;
	var reverse = 1;
	if (diff < 0) {
		diff = -diff;
		reverse = -1;
		arrow = -5;
	}

	var title = "";
	if (reverse == 1) {
		title = "Difference Between " + ((type == 'median') ? "Medians" : "Means") + " (" + cnames[0] + " - " + cnames[1] + ")";
	} else {
		title = "Difference Between " + ((type == 'median') ? "Medians" : "Means") + " (" + cnames[1] + " - " + cnames[0] + ")";
	}
	ctx.font = "bold " + 17 * scalefactor + "px Roboto";
	ctx.fillStyle = "#000000";
	ctx.textAlign = "center";
	ctx.fillText(title, width / 2, height - 10 * scalefactor);

	var steps = (maxXTick - minXTick) / xStep;
	var offset = minXTick + xStep * Math.floor(steps / 2);
	offset = -offset;
	offset = Math.floor(offset / xStep);
	offset = xStep * offset;
	minXTick = minXTick + offset;
	maxXTick = maxXTick + offset;
	horaxis(ctx, left, right, height - 50 * scalefactor, minXTick, maxXTick, xStep);


	var bootstrapDiffs = [];
	var num = xOPoints.length;
	var b = 0;
	var oyPoints = yPoints.slice();
	var errorCount = 0;
	while (b < 1000) {
		i = 0;
		var bootstrap1 = [];
		var bootstrap2 = [];
		yPoints = oyPoints.slice();
		while (i < num) {
			var max = num - i - 1;
			var category = randint(0, max);
			var cat = yPoints[category];
			yPoints.sort();
			if (cat == cnames[0]) {
				bootstrap1.push(xOPoints[i]);
			} else {
				bootstrap2.push(xOPoints[i]);
			}
			i++;
		}
		if (type == "median") {
			var med1 = median(bootstrap1);
			var med2 = median(bootstrap2);
			var dif = (med1 - med2) * reverse;

			bootstrapDiffs.push(dif);
			b++;
		} else {
			if (bootstrap1.length > 0 && bootstrap2.length > 0) {
				var mean1 = calculatemean(bootstrap1);
				var mean2 = calculatemean(bootstrap2);
				var dif = (mean1 - mean2) * reverse;
				bootstrapDiffs.push(dif);
				b++;
			} else {
				errorCount++;
				if (errorCount > 10) {
					return "Error: An error happened " + errorCount + " times... Something must be up with the data.";
				}
			}
		}
	}

	var p = 0;
	bootstrapDiffs.forEach(function (xValue) {
		if (xValue >= diff) {
			p++;
		}
	});

	bootstrapDiffs.sort().reverse();

	var maxHeight = height * 0.5 - 100 * scalefactor;
	var bspoints = [];
	i = 0;
	while (i < 1000) {
		bspoints.push(i);
		i++;
	}
	plotdotplot(ctx, bspoints, bootstrapDiffs, minXTick, maxXTick, height - 60 * scalefactor, left, right, maxHeight, makebscolors(1000, alpha), 1, 0, undefined, undefined, true, true);

	ctx.lineWidth = 3 * scalefactor;
	ctx.strokeStyle = "#004fff";
	ctx.fillStyle = '#004fff';
	var x1 = (width - 120) * (-minXTick) / (maxXTick - minXTick) + 60;
	var x2 = (width - 120) * (diff - minXTick) / (maxXTick - minXTick) + 60;
	line(ctx, x1, height - 70 * scalefactor, x2, height - 70 * scalefactor);
	line(ctx, x2 - arrow, height - 75 * scalefactor, x2, height - 70 * scalefactor);
	line(ctx, x2 - arrow, height - 65 * scalefactor, x2, height - 70 * scalefactor);
	ctx.lineWidth = 3 * scalefactor;
	line(ctx, x2, height - 55 * scalefactor, x2, height * 0.5 + 10);
	ctx.font = 12 * scalefactor + "px Roboto";
	ctx.textAlign = "right";
	ctx.fillText(diff, x2 - 5 * scalefactor, height - 55 * scalefactor);
	ctx.textAlign = "left";
	ctx.fillText("p = " + p + "/1000", x2 + 3, height * 0.5 + 40 * scalefactor);
	ctx.fillText("   = " + p / 1000, x2 + 3, height * 0.5 + 55 * scalefactor);

	if (pointsRemoved > 22) {
		ctx.fillStyle = '#000000';
		ctx.font = 13 * scalefactor + "px Roboto";
		ctx.textAlign = "right";
		ctx.fillText("ID(s) of Points Removed: " + pointsRemoved.join(", "), width - 40 * scalefactor, 40 * scalefactor);
	}

	labelgraph(ctx, width, height);

	if ($('#invert').is(":checked")) {
		invert(ctx);
	}

	return canvas.toDataURL();
}

function newpiechart() {
	$('#zvar').show();
	$('#variable1label').html("category 1:<br><small>required</small>");
	$('#var2label').html("category 2:<br><small>optional</small>");
	$('#var3label').html("frequency:<br><small>optional</small>");

	var canvas = document.getElementById('myCanvas');
	var ctx = canvas.getContext('2d');

	//set size
	var width = $('#width').val();
	var height = $('#height').val();
	ctx.canvas.width = width;
	ctx.canvas.height = height;

	ctx.fillStyle = '#ffffff';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// get points
	var xPoints = $('#xvar').val().split(',');
	xPoints.pop();
	var yPoints = $('#yvar').val().split(',');
	yPoints.pop();

	if (xPoints.length == 0) {
		return 'Error: You must select a variable for "category 1"';
	}

	if (yPoints.length == 0) {
		var centerX = width / 2;
		var centerY = height / 2;
		var diameter = Math.min(height - 150, width - 150);
		var isDonut = false;
		if ($('#donutchart').is(":checked") && $('#donutshow').is(":visible")) {
			isDonut = true;
		}
		var displaySummary = false;
		if ($('#regression').is(":checked") && $('#regshow').is(":visible")) {
			displaySummary = true;
		}
		pie(ctx, xPoints, diameter / 2, centerX, centerY, displaySummary, isDonut, "(num: " + xPoints.length + ")");
		if ($('#regression').is(":checked") && $('#regshow').is(":visible")) {
			ctx.fillStyle = '#000';
			ctx.textAlign = "center";
			ctx.font = "bold " + 15 * scalefactor + "px Roboto";
			var num = "num: " + xPoints.length;
			ctx.fillText(num, centerX, centerY + (diameter / 2) + 30);
		}
	} else {
		var catsY = array_unique(yPoints);
		var full = [];
		for (var cat in catsY) {
			cat = catsY[cat];
			full[cat] = [];
		}
		for (var i in xPoints) {
			var yPoint = yPoints[i];
			var xPoint = xPoints[i];
			full[yPoint].push(xPoint);
		}
		var numGraphs = catsY.length;
		var numWidth = numGraphs;
		if (numGraphs > 3) {
			numWidth = Math.ceil(Math.sqrt(numGraphs));
		}
		var numHeight = Math.ceil(numGraphs / numWidth);
		var graphWidth = Math.round(width - 50) / numWidth;
		var graphHeight = Math.round(height - 80) / numHeight;
		var left = 25 * scalefactor;
		var top = 50 * scalefactor;
		var keys = Object.keys(full);
		keys.sort(sortorder);
		for (var i in keys) {
			var cat = keys[i];
			var points = full[cat];
			if (left > width - 30 * scalefactor) {
				left = 25 * scalefactor;
				top += graphHeight;
			}
			var centerX = graphWidth / 2 + left;
			var centerY = graphHeight / 2 + top - 20 * scalefactor;
			var diameter = Math.min(graphHeight - 50, graphWidth - 10);
			var isDonut = false;
			if ($('#donutchart').is(":checked") && $('#donutshow').is(":visible")) {
				isDonut = true;
			}
			var displaySummary = false;
			if ($('#regression').is(":checked") && $('#regshow').is(":visible")) {
				displaySummary = true;
			}
			pie(ctx, points, diameter / 2, centerX, centerY, displaySummary, isDonut, cat);
			if ($('#regression').is(":checked") && $('#regshow').is(":visible")) {
				cat += " (num: " + points.length + ")";
			}
			ctx.fillStyle = '#000';
			ctx.textAlign = "center";
			ctx.font = "bold " + 15 * scalefactor + "px Roboto";
			ctx.fillText(cat, centerX, centerY + (diameter / 2) + 30);
			left += graphWidth;
		}
	}

	ctx.fillStyle = '#000';
	drawTitle(ctx, $('#title').val(), width / 2, 30 * scalefactor, 20);

	labelgraph(ctx, width, height);

	if ($('#invert').is(":checked")) {
		invert(ctx);
	}

	return canvas.toDataURL();
}

function pie(ctx, xPoints, radius, centerX, centerY, displaySummary, isDonut, group) {
	if (radius <= 0) {
		return 'Error: The number of pie charts being drawn is too large!';
	}
	var freq = array_count_values(xPoints);
	var total = 0;
	var keys = Object.keys(freq);
	for (var key in keys) {
		key = keys[key];
		total += freq[key];
	}
	keys.sort(sortorder);
	ctx.font = 14 * scalefactor + "px Roboto";
	ctx.textAlign = "center";
	var rot = 270;
	for (var key in keys) {
		key = keys[key];
		var numInKey = freq[key];
		var angle = numInKey / total * 360;
		var start = Math.round(rot);
		var end = Math.round(rot + angle);
		var pixX = Math.round(radius * Math.cos(deg2rad(start)) + centerX);
		var pixY = Math.round(radius * Math.sin(deg2rad(start)) + centerY);
		ctx.strokeStyle = intToHex(hashCode(key));
		ctx.fillStyle = intToHex(hashCode(key));
		ctx.beginPath();
		ctx.moveTo(centerX, centerY);
		ctx.lineTo(pixX, pixY);
		ctx.arc(centerX, centerY, radius, deg2rad(start), deg2rad(end));
		// We don't need to move back to the next point, since the path finding algorithm can work out we want to go back
		ctx.fill();
		rot += angle;
	}
	ctx.fillStyle = '#000000';
	ctx.strokeStyle = '#000000';
	ctx.beginPath();
	ctx.ellipse(centerX, centerY, radius, radius, 0, 0, 2 * Math.PI);
	ctx.stroke();
	var rot = 270;
	for (var key in keys) {
		key = keys[key];
		var numInKey = freq[key];
		var angle = numInKey / total * 360;
		var start = Math.round(rot);
		var end = Math.round(rot + angle);
		var half = (start + end) / 2;
		var pixX = Math.round(radius * Math.cos(deg2rad(start)) + centerX);
		var pixY = Math.round(radius * Math.sin(deg2rad(start)) + centerY);
		line(ctx, centerX, centerY, pixX, pixY);
		pixX = Math.round(radius * 0.8 * Math.cos(deg2rad(half)) + centerX);
		pixY = Math.round(radius * 0.8 * Math.sin(deg2rad(half)) + centerY);
		ctx.fillStyle = '#000';
		ctx.fillText(key, pixX, pixY + 5 * scalefactor);
		if (displaySummary) {
			ctx.font = 12 * scalefactor + "px Roboto";
			ctx.fillText("(num: " + numInKey + ")", pixX, pixY + 20 * scalefactor);
			ctx.font = 14 * scalefactor + "px Roboto";
		}
		var points = centerX / scalefactor + "," + centerY / scalefactor;
		var startangle = start;
		var i = 0;
		while(i <= 10) {
			var l = (radius * Math.cos(deg2rad(startangle)) + centerX) / scalefactor;
			var t = (radius * Math.sin(deg2rad(startangle)) + centerY) / scalefactor;
			points += ","+l+","+t;
			startangle += angle / 10;
			i++;
		}
		points += centerX / scalefactor + "," + centerY / scalefactor;
		var desc = $('#xaxis').val() + ": " + key + "<br>" + $('#yaxis').val() + ": " + group + "<br>num: " + numInKey + "<br>" + ((numInKey / total) * 100).toFixed(1) + "% of " + group;
		$('#graphmap').append('<area shape="poly" coords="' + points + '" desc="' + desc + '">');
		rot += angle;
	}
	if (isDonut) {
		ctx.fillStyle = '#fff';
		ctx.beginPath();
		ctx.arc(centerX, centerY, (radius * 2) * 0.3, 0, 2 * Math.PI);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	}
}

function deg2rad(degrees) {
	return degrees * (Math.PI / 180);
}

function hashCode(str) {
	var hash = 0;
	for (var i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	return hash;
}

function intToHex(int) {
	var c = (int & 0x00FFFFFF).toString(16).toUpperCase();
	var hex = "00000".substr(0, 6 - c.length) + c;
	var rgb = hexToRgb(hex);
	if (Math.sqrt(0.299 * (rgb.r * rgb.r) + 0.587 * (rgb.g * rgb.g) + 0.114 * (rgb.b * rgb.b)) < 127.5) {
		rgb.r += randint(60, 200);
		rgb.g += randint(60, 200);
		rgb.b += randint(60, 200);
		if (rgb.r > 255) rgb.r = 255;
		if (rgb.g > 255) rgb.g = 255;
		if (rgb.b > 255) rgb.b = 255;
		hex = rgbToHex(rgb.r, rgb.g, rgb.b);
	} else {
		hex = "#" + hex;
	}
	return hex;
}

function componentToHex(c) {
	var hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
	return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}


function hexToRgb(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
}

function array_sum(array) {
	var sum = 0;
	if (Object.keys(array).length > 0) {
		var keys = Object.keys(array);
		for (var key in keys) {
			sum += Number(array[keys[key]]);
		}
	} else {
		for (var i = 0; i < array.length; i++) {
			sum += Number(array[i]);
		}
	}
	return sum;
}

function array_unique(array) {
	var found = {};
	var result = [];
	var j = 0;
	for (var i = 0; i < array.length; i++) {
		var item = array[i];
		if (found[item] !== 1) {
			found[item] = 1;
			result[j++] = item;
		}
	}
	return result;
}

function array_count_values(array) {
	var counts = {};
	for (var i = 0; i < array.length; i++) {
		var key = array[i];
		counts[key] = (counts[key]) ? counts[key] + 1 : 1;
	}
	return counts;
}

/**
 * Draw the title of the graph
 * @param ctx canvas context
 * @param title the title of the graph
 * @param x the x coordinate
 * @param y the y coordinate of the first line
 * @param fontsize the font size
 */
function drawTitle(ctx, title, x, y, fontsize) {
	ctx.font = "bold " + fontsize * scalefactor + "px Roboto";
	var numCharacters = document.getElementById("numCharactersBeforeNewLine").value;
	ctx.textAlign = "center";
	if (title.length < numCharacters) { // We don't have to run this check, but by doing this we don't have to spend resources by doing regex matching
		ctx.fillText(title, x, y);
	} else {
		// Split into lines
		var split = title.match(new RegExp(".{1," + numCharacters + "}(\\s|$)", 'g'));
		var titleY = y;
		split.forEach(function (t, index) {
			ctx.fillText(split[index], x, titleY);
			titleY += 25 * scalefactor;
		});
	}
}

function arrow(ctx, x1, y1, x2, y2, aLength, aWidth) {
	var distance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y1, 2));
	var dx = x2 + (x1 - x2) * aLength / distance;
	var dy = y2 + (y1 - y2) * aLength / distance;

	var k = aWidth / aLength;

	var x2o = x2 - dx;
	var y2o = dy - y2;

	var x3 = y2o * k + dx;
	var y3 = x2o * k + dy;

	var x4 = dx - y2o * k;
	var y4 = dy - x2o * k;

	line(ctx, x1, y1, dx, dy);
	ctx.beginPath();
	ctx.moveTo(x2, y2);
	ctx.lineTo(x3, y3);
	ctx.lineTo(x4, y4);
	ctx.lineTo(x2, y2);
	ctx.fill();
}

/**
 * Thanks to locutus.io for the array_multisort function from PHP
 *
 * discuss at: http://locutus.io/php/array_multisort/
 * original by: Theriault (https://github.com/Theriault)
 * improved by: Oleg Andreyev (https://github.com/oleg-andreyev)
 * @param arr
 * @returns {boolean}
 */
function array_multisort(arr) {
	var g
	var i
	var j
	var k
	var l
	var sal
	var vkey
	var elIndex
	var lastSorts
	var tmpArray
	var zlast

	var sortFlag = [0]
	var thingsToSort = []
	var nLastSort = []
	var lastSort = []
	// possibly redundant
	var args = arguments

	var flags = {
		'SORT_REGULAR': 16,
		'SORT_NUMERIC': 17,
		'SORT_STRING': 18,
		'SORT_ASC': 32,
		'SORT_DESC': 40
	}

	var sortDuplicator = function (a, b) {
		return nLastSort.shift()
	}

	var sortFunctions = [
		[

			function (a, b) {
				lastSort.push(a > b ? 1 : (a < b ? -1 : 0))
				return a > b ? 1 : (a < b ? -1 : 0)
			},
			function (a, b) {
				lastSort.push(b > a ? 1 : (b < a ? -1 : 0))
				return b > a ? 1 : (b < a ? -1 : 0)
			}
		],
		[

			function (a, b) {
				lastSort.push(a - b)
				return a - b
			},
			function (a, b) {
				lastSort.push(b - a)
				return b - a
			}
		],
		[

			function (a, b) {
				lastSort.push((a + '') > (b + '') ? 1 : ((a + '') < (b + '') ? -1 : 0))
				return (a + '') > (b + '') ? 1 : ((a + '') < (b + '') ? -1 : 0)
			},
			function (a, b) {
				lastSort.push((b + '') > (a + '') ? 1 : ((b + '') < (a + '') ? -1 : 0))
				return (b + '') > (a + '') ? 1 : ((b + '') < (a + '') ? -1 : 0)
			}
		]
	]

	var sortArrs = [
		[]
	]

	var sortKeys = [
		[]
	]

	// Store first argument into sortArrs and sortKeys if an Object.
	// First Argument should be either a Javascript Array or an Object,
	// otherwise function would return FALSE like in PHP
	if (Object.prototype.toString.call(arr) === '[object Array]') {
		sortArrs[0] = arr
	} else if (arr && typeof arr === 'object') {
		for (i in arr) {
			if (arr.hasOwnProperty(i)) {
				sortKeys[0].push(i)
				sortArrs[0].push(arr[i])
			}
		}
	} else {
		return false
	}

	// arrMainLength: Holds the length of the first array.
	// All other arrays must be of equal length, otherwise function would return FALSE like in PHP
	// sortComponents: Holds 2 indexes per every section of the array
	// that can be sorted. As this is the start, the whole array can be sorted.
	var arrMainLength = sortArrs[0].length
	var sortComponents = [0, arrMainLength]

	// Loop through all other arguments, checking lengths and sort flags
	// of arrays and adding them to the above variables.
	var argl = arguments.length
	for (j = 1; j < argl; j++) {
		if (Object.prototype.toString.call(arguments[j]) === '[object Array]') {
			sortArrs[j] = arguments[j]
			sortFlag[j] = 0
			if (arguments[j].length !== arrMainLength) {
				return false
			}
		} else if (arguments[j] && typeof arguments[j] === 'object') {
			sortKeys[j] = []
			sortArrs[j] = []
			sortFlag[j] = 0
			for (i in arguments[j]) {
				if (arguments[j].hasOwnProperty(i)) {
					sortKeys[j].push(i)
					sortArrs[j].push(arguments[j][i])
				}
			}
			if (sortArrs[j].length !== arrMainLength) {
				return false
			}
		} else if (typeof arguments[j] === 'string') {
			var lFlag = sortFlag.pop()
			// Keep extra parentheses around latter flags check
			// to avoid minimization leading to CDATA closer
			if (typeof flags[arguments[j]] === 'undefined' ||
				((((flags[arguments[j]]) >>> 4) & (lFlag >>> 4)) > 0)) {
				return false
			}
			sortFlag.push(lFlag + flags[arguments[j]])
		} else {
			return false
		}
	}

	for (i = 0; i !== arrMainLength; i++) {
		thingsToSort.push(true)
	}

	// Sort all the arrays....
	for (i in sortArrs) {
		if (sortArrs.hasOwnProperty(i)) {
			lastSorts = []
			tmpArray = []
			elIndex = 0
			nLastSort = []
			lastSort = []

			// If there are no sortComponents, then no more sorting is neeeded.
			// Copy the array back to the argument.
			if (sortComponents.length === 0) {
				if (Object.prototype.toString.call(arguments[i]) === '[object Array]') {
					args[i] = sortArrs[i]
				} else {
					for (k in arguments[i]) {
						if (arguments[i].hasOwnProperty(k)) {
							delete arguments[i][k]
						}
					}
					sal = sortArrs[i].length
					for (j = 0, vkey = 0; j < sal; j++) {
						vkey = sortKeys[i][j]
						args[i][vkey] = sortArrs[i][j]
					}
				}
				sortArrs.splice(i, 1)
				sortKeys.splice(i, 1)
				continue
			}

			// Sort function for sorting. Either sorts asc or desc, regular/string or numeric.
			var sFunction = sortFunctions[(sortFlag[i] & 3)][((sortFlag[i] & 8) > 0) ? 1 : 0]

			// Sort current array.
			for (l = 0; l !== sortComponents.length; l += 2) {
				tmpArray = sortArrs[i].slice(sortComponents[l], sortComponents[l + 1] + 1)
				tmpArray.sort(sFunction)
				// Is there a better way to copy an array in Javascript?
				lastSorts[l] = [].concat(lastSort)
				elIndex = sortComponents[l]
				for (g in tmpArray) {
					if (tmpArray.hasOwnProperty(g)) {
						sortArrs[i][elIndex] = tmpArray[g]
						elIndex++
					}
				}
			}

			// Duplicate the sorting of the current array on future arrays.
			sFunction = sortDuplicator
			for (j in sortArrs) {
				if (sortArrs.hasOwnProperty(j)) {
					if (sortArrs[j] === sortArrs[i]) {
						continue
					}
					for (l = 0; l !== sortComponents.length; l += 2) {
						tmpArray = sortArrs[j].slice(sortComponents[l], sortComponents[l + 1] + 1)
						// alert(l + ':' + nLastSort);
						nLastSort = [].concat(lastSorts[l])
						tmpArray.sort(sFunction)
						elIndex = sortComponents[l]
						for (g in tmpArray) {
							if (tmpArray.hasOwnProperty(g)) {
								sortArrs[j][elIndex] = tmpArray[g]
								elIndex++
							}
						}
					}
				}
			}

			// Duplicate the sorting of the current array on array keys
			for (j in sortKeys) {
				if (sortKeys.hasOwnProperty(j)) {
					for (l = 0; l !== sortComponents.length; l += 2) {
						tmpArray = sortKeys[j].slice(sortComponents[l], sortComponents[l + 1] + 1)
						nLastSort = [].concat(lastSorts[l])
						tmpArray.sort(sFunction)
						elIndex = sortComponents[l]
						for (g in tmpArray) {
							if (tmpArray.hasOwnProperty(g)) {
								sortKeys[j][elIndex] = tmpArray[g]
								elIndex++
							}
						}
					}
				}
			}

			// Generate the next sortComponents
			zlast = null
			sortComponents = []
			for (j in sortArrs[i]) {
				if (sortArrs[i].hasOwnProperty(j)) {
					if (!thingsToSort[j]) {
						if ((sortComponents.length & 1)) {
							sortComponents.push(j - 1)
						}
						zlast = null
						continue
					}
					if (!(sortComponents.length & 1)) {
						if (zlast !== null) {
							if (sortArrs[i][j] === zlast) {
								sortComponents.push(j - 1)
							} else {
								thingsToSort[j] = false
							}
						}
						zlast = sortArrs[i][j]
					} else {
						if (sortArrs[i][j] !== zlast) {
							sortComponents.push(j - 1)
							zlast = sortArrs[i][j]
						}
					}
				}
			}

			if (sortComponents.length & 1) {
				sortComponents.push(j)
			}
			if (Object.prototype.toString.call(arguments[i]) === '[object Array]') {
				args[i] = sortArrs[i]
			} else {
				for (j in arguments[i]) {
					if (arguments[i].hasOwnProperty(j)) {
						delete arguments[i][j]
					}
				}

				sal = sortArrs[i].length
				for (j = 0, vkey = 0; j < sal; j++) {
					vkey = sortKeys[i][j]
					args[i][vkey] = sortArrs[i][j]
				}
			}
			sortArrs.splice(i, 1)
			sortKeys.splice(i, 1)
		}
	}
	return true
}