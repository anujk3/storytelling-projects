(function() {
	var margin = { top: 30, left: 30, right: 30, bottom: 30},
		height = 400 - margin.top - margin.bottom,
		width = 585 - margin.left - margin.right;

	// Create a time parser
	var parse = d3.timeParse("%a, %d %b %Y %I:%M %p");
	function timeparse(curr_str){
		var curr = curr_str.split(":");

		if (curr.length == 3){
			hh = (+curr[0]);
			mm = (+curr[1]);
			ss = (+curr[2]);
			// console.log(hh, mm, ss);
			num_mins = hh*60 + mm;
			// console.log(num_mins + "." + ss);
			total_minutes = num_mins + "." + ss;
			return parseFloat(total_minutes);
		}else{
			mm = (+curr[0]);
			ss = (+curr[1]);
			// console.log(mm, ss);
			total_mins = (mm);
			// console.log(total_mins + "." + ss);
			total_minutes = total_mins + "." + ss;
			return parseFloat(total_minutes);
		}
	}

	function create_new_datapoints(nested){
		// console.log(nested);

		var aggregates = [];

		for (i in nested){
			// console.log(i);
			var element = {};
			var totalmins = 0;
			// console.log(nested[i].key);
			for (j in nested[i].values){
				// console.log(nested[i].values[j].timemins);
				totalmins = totalmins + nested[i].values[j].timemins;
			}
			element.activity = nested[i].key;
			element.totalmins = Math.log10(totalmins);
			aggregates.push(element);
		}

		// console.log(aggregates);
		return aggregates;
	}

	// What is this???
	var svg = d3.select("#chart_1b_radial")
		.append("svg")
		.attr("height", height + margin.top + margin.bottom)
		.attr("width", width + margin.left + margin.right)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var radius = 100;

	var radiusScale = d3.scaleLinear()
		.range([0, radius]);

	var angleScale = d3.scalePoint()
		.domain(['Running', 'Strength Training', 'Cardio', 'Treadmill Running'])
		.range([0, Math.PI * 2]);

	var colorScale = d3.scaleLinear().range(['lightblue', 'pink']);

	var radialLine = d3.radialLine()
		.angle(function(d) {
			return angleScale(d.activity)
		})
		.radius(function(d) {
			return radiusScale(d.totalmins);
		});


	d3.queue()
		.defer(d3.csv, "full_data.csv", function(d) {
			// While we're reading the data in, parse each date
			// into a datetime object so it isn't just a string
			// save it as 'd.datetime'
			// d.datetime is now your 'useful' date, you can ignore
			// d.Date. Feel free to use console.log to check it out.
			d.activityStartTime = parse(d.startTime);
			//console.log(d.Date)
			d.avgHR = +d.avgHR;
			d.avgSpeed = +d["avgSpeed(min/km)"];
			d.calories = +d.calories;
			d.timemins = timeparse(d.time);
			d.distance = +d.distance;
			d.elevationGain = +d.elevationGain;
			d.maxHR = +d.maxHR;

			// console.log(d.activityStartTime);
			return d;
		})
		.await(ready);

	function ready(error, datapoints) {

		// console.log(datapoints);

		var nested = d3.nest() // fire up d3.nest
			.key(function(d) { // group them by activity type
				return d.activityType;
			})
			.entries(datapoints);// and here is our data

		// console.log(nested);

		var aggregates = create_new_datapoints(nested);

		var g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");


		var maxMinutes = d3.max(aggregates, function(d) { return d.totalmins; });
		radiusScale.domain([0, maxMinutes]);
		colorScale.domain([0, maxMinutes]);

		aggregates.push(aggregates[0]);
		// console.log(aggregates);


		g.selectAll("circle")
			.data([0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5])
			.enter().append("circle")
			.attr("cx", 0)
			.attr("cy", 0)
			.attr("r", function(d) {
				return radiusScale(d)
			})
			.attr("fill", "none")
			.attr("stroke", function(d) {
				return colorScale(d)
			});

		g.append("path")
			.datum(aggregates)
			.attr("d", radialLine)
			.attr("stroke", "black")
			.attr("stroke-width", 2)
			.attr("fill", "none");

		g.selectAll(".time")
			.data(aggregates)
			.enter()
			.append("text")
			.attr("x", function(d) {
				var a = angleScale(d.activity);
				var r = radiusScale(d.totalmins);
				return (r + 10) * Math.sin(a);
			})
			.attr("y", function(d) {
				var a = angleScale(d.activity);
				var r = radiusScale(d.totalmins);
				return (r + 10) * Math.cos(a) * -1;
			})
			.attr("font-size", 12)
			.attr("text-anchor", function (d) {
				if (d.activity == "Treadmill Running") {
					return "end";
				} else{
					return "middle";
				}

			})
			.attr("alignment-baseline", "middle")
			.text(function(d) {
				return d.activity;
			});

		g.selectAll(".activity-line")
			.data(aggregates)
			.enter().append("line")
			.attr("x0", 0)
			.attr("y0", 0)
			.attr("x1", function(d) {
				var a = angleScale(d.activity);
				return radius * Math.sin(a);
			})
			.attr("y1", function(d) {
				var a = angleScale(d.activity);
				return radius * Math.cos(a) * -1;
			})
			.attr("stroke", "lightgray");



	}
})();