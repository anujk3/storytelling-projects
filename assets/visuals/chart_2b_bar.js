(function() {
	var margin = { top: 30, left: 50, right: 30, bottom: 30},
		height = 400 - margin.top - margin.bottom,
		width = 780 - margin.left - margin.right;

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
			return "<strong>Calories Burnt:</strong> <span style='color:red'>" + d.calories + "</span><br>" +
					"<strong>Day of Workout:</strong> <span style='color:blue'>" + d.activityStartTime + "</span>";
		});

	var svg = d3.select("#chart_2b_bar")
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
			return num_mins + "." + ss;
		}else{
			mm = (+curr[0]);
			ss = (+curr[1]);
			// console.log(mm, ss);
			total_mins = (mm);
			// console.log(total_mins + "." + ss);
			return total_mins + "." + ss;
		}
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

		// NOTE:I've done it for the datetime, you do it for the close price
		var timeCalories = datapoints.map(function(d) { return d.activityStartTime; });
		// console.log(activities);
		xPositionScale.domain(timeCalories);

		var maxCalories = d3.max(datapoints, function(d) { return d.calories; });
		yPositionScale.domain([0, maxCalories]);


		svg.selectAll(".bar")
			.data(datapoints)
			.enter()
			.append("rect")
			.attr("class", "bar")
			.attr("x", function(d) {
				// console.log(d);
				return xPositionScale(d.activityStartTime);
			})
			.attr("y", function(d) {
				return yPositionScale(d.calories);
			})
			.attr("width", xPositionScale.bandwidth())
			.attr("height", function(d) {
				return height - yPositionScale(d.calories);
			})
			.on('mouseover', tip.show)
			.on('mouseout', tip.hide);



		// Set up our x axis
		var xAxis = d3.axisBottom(xPositionScale).tickFormat(d3.timeFormat("%Y"));

		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis)
			.selectAll("text").remove();

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
			.text("Calories Burnt");

	}
})();