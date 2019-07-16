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

    plotscatter(ctx, points, fitted, residuals, minxtick, maxxtick, xstep, minytick, maxytick, ystep, gtop, bottom, left, right, colors);

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

    var alpha = 1 - $('#trans').val() / 100;
    var colours = makecolors(alpha, ctx);

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
            ctx.fillStyle = '#d3d3d3';
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
                    ctx.fillStyle = '#d3d3d3';
                    yb = yb + (height - 100 * scalefactor) * full[catX][catY] / numY;
                    ctx.fillRect(xa + 3 * scalefactor, ya + 3 * scalefactor, xb - xa - 3 * scalefactor, yb - ya - 3 * scalefactor);
                    ctx.strokeRect(xa + 3 * scalefactor, ya + 3 * scalefactor, xb - xa - 3 * scalefactor, yb - ya - 3 * scalefactor);
                    ctx.fillStyle = '#000000';
                    ctx.fillText(catY, (xa + xb) / 2, (ya + yb) / 2 + 5 * scalefactor)
                }
            });
        });
    }


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

    // get points
    var xPoints = $('#xvar').val().split(',');
    xPoints.pop();
    var yPoints = $('#yvar').val().split(',');
    yPoints.pop();

    var i = 0;
    var pointsRemoved = [];
    for (var xPoint in xPoints) {
        if (!$.isNumeric(xPoint)) {
            xPoints.splice(xPoint, 1);
            yPoints.splice(xPoint, 1);
            pointsRemoved += (i + 1) + ", ";
        }
        i++;
    }

    console.log("length: " + xPoints.length);

    if (xPoints.length == 0 || !($.isNumeric(xPoints[0]))) {
        console.log("not numerical");
        return 'Error: You must select a numerical x-variable';
    }

    if (pointsRemoved.length != 0) {
        ctx.fillStyle = '#000000';
        ctx.font = 13 * scalefactor + "px Roboto";
        ctx.textAlign = "right";
        ctx.fillText("ID(s) of Points Removed: " + pointsremoved.join(", "), width - 40 * scalefactor, 40 * scalefactor);
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
                yPoints[i] = "b: " + c1max - c2max;
            } else if (value < c3max) {
                yPoints[i] = "c: " + c2max - c3max;
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
        if (relativeFrequency) {
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
    var yAxis = gTop + axisOffset;
    var oldYAxis = gTop;
    var axisTolerance = 40 * scalefactor;
    var axisWidth = width - 170 * scalefactor;
    for (var key in dataKeys) {
        key = dataKeys[key];
        var values = data[key];
        var i = 0;
        // Axis
        horaxis(ctx, left, right, yAxis - axisTolerance, minXTick, maxXTick, xStep);
        vertaxis(ctx, oldYAxis, yAxis - axisTolerance, left - 10 * scalefactor, minYTick, maxYTick, yStep, undefined, false, false);
        ctx.save();
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

        var valueKeys = Object.keys(values);
        for(var valueKey in valueKeys) {
            var xBucket = parseFloat(valueKeys[valueKey]);
            var freq = values[xBucket];
            var x1 = (axisWidth * (xBucket - minXTick) / (maxXTick - minXTick)) + 90 * scalefactor;
            var x2 = (axisWidth * ((xBucket + xStep) - minXTick) / (maxXTick - minXTick)) + 90 * scalefactor;
            var w = x2 - x1;
            var div = 1;
            if(relativeFrequency) {
                div = num;
            }
            var y1 = convertvaltopixel(freq, minYTick, maxYTick, yAxis - axisTolerance, oldYAxis);
            var h = (yAxis - axisTolerance) - y1;
            line(ctx, x1, y1, x2, y1);
            ctx.fillRect(x1, y1, w, h);
            ctx.strokeRect(x1, y1, w, h);
        }
        ctx.fillStyle = '#ed0000';
        ctx.font = 11 * scalefactor + "px Roboto";
        ctx.textAlign = "left";
        if($('#regression').is(":checked") && $('#regshow').is(":visible")) {
            ctx.fillText("med:  " + med, 90 * scalefactor, oldYAxis);
            ctx.fillText("mean:  " + mean, 90 * scalefactor, oldYAxis + 10 * scalefactor);
            ctx.fillText("num:  " + num, 90 * scalefactor, oldYAxis + 20 * scalefactor);
        }

        oldYAxis = yAxis;
        yAxis += axisOffset;
    }

    return canvas.toDataURL();
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
    ctx.textAlign = "center";
    if(title.length < 80) { // We don't have to run this check, but by doing this we don't have to spend resources by doing regex matching
        ctx.fillText(title, x, y);
    } else {
        // Split into lines
        var split = title.match(/.{1,80}(\s|$)/g);
        var titleY = y;
        split.forEach(function(t,index) {
            ctx.fillText(split[index], x, titleY);
            titleY += 25 * scalefactor;
        });
    }
}