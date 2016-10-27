(function() {
	var margin = {top: 40, right: 70, bottom: 40, left: 70},
		width = 860 - margin.left - margin.right,
		height = 400 - margin.top - margin.bottom;

	// We'll set the domain once we've read in
	// the data
	var xPositionScale = d3.scaleBand()
		.range([0, width])
		.padding(0.1);

	var yPositionScale = d3.scaleLinear()
		.range([height, 0]);

	var tip = d3.tip()
		.attr('class', 'd3-tip')
		.offset([-10, 0])
		.html(function(d) {
			return "<strong>Minutes Spent:</strong> <span style='color:red'>" + d.totalmins + "</span>";
		});

	var svg = d3.select("#chart_1a_bar")
		.append("svg")
		.attr("height", height + margin.top + margin.bottom)
		.attr("width", width + margin.left + margin.right)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	svg.call(tip);


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
			return parseInt(total_minutes);
		}else{
			mm = (+curr[0]);
			ss = (+curr[1]);
			// console.log(mm, ss);
			total_mins = (mm);
			// console.log(total_mins + "." + ss);
			total_minutes = total_mins + "." + ss;
			return parseInt(total_minutes);
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
			element.totalmins = totalmins;
			aggregates.push(element);
		}

		// console.log(aggregates);
		return aggregates;
	}



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

		// Get the max and min of datetime and Close,
		// then use that to set the domain of your scale

		// console.log(datapoints);

		var nested = d3.nest() // fire up d3.nest
			.key(function(d) { // group them by activity type
				return d.activityType;
			})
			.entries(datapoints);// and here is our data

		// console.log(nested);

		var aggregates = create_new_datapoints(nested);
		// console.log(aggregates);

		var activities = aggregates.map(function(d) { return d.activity; });
		// console.log(activities);
		xPositionScale.domain(activities);

		var totalmins = d3.max(aggregates, function(d) { return d.totalmins; });
		// console.log(totalminutes);
		yPositionScale.domain([0, totalmins]);

		svg.selectAll(".bar")
			.data(aggregates)
			.enter()
			.append("rect")
			.attr("class", "bar")
			.attr("x", function(d) {
				// console.log(d);
				return xPositionScale(d.activity);
			})
			.attr("y", function(d) {
				return yPositionScale(d.totalmins);
			})
			.attr("width", xPositionScale.bandwidth())
			.attr("height", function(d) {
				return height - yPositionScale(d.totalmins);
			})
			.on('mouseover', tip.show)
			.on('mouseout', tip.hide);

		// svg.append("text")
		// 	.attr("x", width/2)
		// 	.attr("y", 0)
		// 	.attr("text-anchor", "right")
		// 	.attr("font-weight", "500")
		// 	.text("Total Minutes Spent on Various Activities");

		// Set up our x axis
		var xAxis = d3.axisBottom(xPositionScale);

		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);

		// set up our y axis
		var yAxis = d3.axisLeft(yPositionScale);

		svg.append("g")
			.attr("class", "y axis")
			.call(yAxis)
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text("Total Minutes");

	};

})();