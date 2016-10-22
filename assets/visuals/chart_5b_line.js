(function() {
	var margin = { top: 30, left: 100, right: 30, bottom: 30},
		height = 400 - margin.top - margin.bottom,
		width = 780 - margin.left - margin.right;

	console.log("Building chart 5");

	var svg = d3.select("#chart_5b_line")
		.append("svg")
		.attr("height", height + margin.top + margin.bottom)
		.attr("width", width + margin.left + margin.right)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// Create your scales, but ONLY give them a range
	// (you'll set the domain once you read in your data)
	var xPositionScale = d3.scaleLinear().range([0, width]);
	var yPositionScale = d3.scaleLinear().range([height, 0]);

	// let's make a color scale!
	var colorScale = d3.scaleOrdinal().domain(["2012", "2013", "2014", "2015", "2016"])
		.range(["red", "orange", "green", "yellow", "purple"]);

	// Create a d3.line function
	var line = d3.line()
		.x(function(d) {
			return xPositionScale(d.Month);
		})
		.y(function(d) {
			return yPositionScale(d.Mileage);
		})
		.curve(d3.curveMonotoneX);

	// Import your data file using d3.queue()
	d3.queue()
		.defer(d3.csv, "year_month_mileage.csv", function(d) {
			// While we're reading the data in, parse each date
			// into a datetime object so it isn't just a string
			// save it as 'd.datetime'
			// d.datetime is now your 'useful' date, you can ignore
			// d.Date. Feel free to use console.log to check it out.
			// d.Year = parse(d.TIME);
			// console.log(d.Date)
			// console.log(d.datetime);
			d.Month = +d.Month;
			d.Mileage = +d.Mileage;
			return d;
		})
		.await(ready);

	// Fix up the function definition! It doesn't just get an error...
	function ready(error, datapoints) {

		console.log(datapoints);

		// defining our scales
		var minmonth = d3.min(datapoints, function(d) { return d.Month });
		var maxmonth = d3.max(datapoints, function(d) { return d.Month });
		xPositionScale.domain([minmonth, maxmonth]);

		var minmileage = d3.min(datapoints, function(d) { return d.Mileage; });
		var maxmileage = d3.max(datapoints, function(d) { return d.Mileage; });
		yPositionScale.domain([minmileage, maxmileage+20]);

		// we would LOVE to group them
		// possibly using group by???? but no, d3 wants to NEST them??

		var nested = d3.nest() // fire up d3.nest
			.key(function(d) { // group them by country
				return d.Year;
			})
			.entries(datapoints);// and here is our data

		console.log(nested);

		svg.selectAll(".mileage-lines")
			.data(nested)
			.enter().append("path")
			.attr("d", function(d) {
				// it's a function because each d (shape of path) is different
				// console.log(d);
				// all of our data points seem to be hiding in d.values
				// because that's just what d3.nest does and it puts the
				// name of the group in d.key
				// console.log(d.values);
				// so let's feed our line function d.values
				return line(d.values);
			})
			.attr("fill", "none")
			.attr("stroke", function(d) {
				// console.log("The nested thing looks like", d);
				return colorScale(d.key);
			});

		// Draw your dots
		svg.selectAll(".country-circle")
			.data(datapoints)
			.enter().append("circle")
			.attr("r", 2)
			.attr("cx", function(d) {
				return xPositionScale(d.Month)
			})
			.attr("cy", function(d) {
				return yPositionScale(d.Mileage)
			})
			.attr("fill", function (d) {
				return colorScale(d.Year);
			})
		;

		svg.selectAll("text")
			.data(nested)
			.enter().append("text")
			.attr("y", function(d) {
				var lastDataPoint = d.values[d.values.length - 1];
				return yPositionScale(lastDataPoint.Mileage);
			})
			.attr("x", width-15)
			.text(function(d) {
				return d.key;
			})
			.attr("dy", 5)
			.attr("dx", 4)
			.attr("fill", function(d){
				return "blue";
			})
			.attr("opacity", function (d) {
				if(d.key=="2016"){
					return 0;
				}

			})
			.attr("font-size", 12);


		// Add your axes
		var xAxis = d3.axisBottom(xPositionScale);
		svg.append("g")
			.attr("class", "axis x-axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);

		var yAxis = d3.axisLeft(yPositionScale);
		svg.append("g")
			.attr("class", "axis y-axis")
			.call(yAxis);

	}
})();