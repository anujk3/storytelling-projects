(function() {
	var margin = { top: 30, left: 100, right: 30, bottom: 30},
		height = 400 - margin.top - margin.bottom,
		width = 780 - margin.left - margin.right;

	console.log("Building chart 5");

	var svg = d3.select("#chart_5a_line")
		.append("svg")
		.attr("height", height + margin.top + margin.bottom)
		.attr("width", width + margin.left + margin.right)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


	var colorScale = d3.scaleOrdinal(d3.schemeCategory20);

	var tip = d3.tip()
		.attr('class', 'd3-tip')
		.offset([-10, 0])
		.html(function(d) {
			return "<strong>Activity:</strong> <span style='color:red'>" + d.key + "</span><br>";
		});

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

		var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

		var aggregates = [];

		for (i=0;i < nested.length; i++){
			// console.log(nested[i].key);
			var element = {"Jan":0, "Feb":0, "Mar":0, "Apr":0, "May":0, "Jun":0, "Jul":0, "Aug":0, "Sep":0, "Oct":0, "Nov":0,"Dec":0};

			for(j=0;j<nested[i].values.length;j++){
				//console.log(nested[i].values.activityType);
				if (nested[i].values[j].activityType == "Running") {
					element[months[nested[i].values[j].activityStartTime.getMonth()]] += nested[i].values[j].distance;
					// console.log(nested[i].values[j].activityStartTime.getMonth());
				}
			}
			var element_to_push = {};
			element_to_push.key = nested[i].key;

			var months_data_to_push = [];
			for (var key in element){
				// console.log(key);
				// console.log(element[key]);
				var months_data = {};
				months_data.month = key;
				months_data.mileage = element[key];
				months_data_to_push.push(months_data);
			}

			element_to_push.values = months_data_to_push;
			aggregates.push(element_to_push);

			// element[nested[i].activityType] = element[nested[i].activityType] + parseFloat(nested[i].timemins);
		}
		// console.log(aggregates);

		return aggregates;
	}

	// Create your scales
	var xPositionScale = d3.scalePoint().domain(["Jan","Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]).range([0, width-20]);
	var yPositionScale = d3.scaleLinear().range([height, 0]);


	// Do you need a d3.line function for this? Maybe something similar?
	var line = d3.line()
		.x(function(d) {
			// console.log(d.month);
			return xPositionScale(d.month);
		})
		.y(function(d) {
			// console.log(d.mileage);
			return yPositionScale(d.mileage);
		})
		.curve(d3.curveMonotoneX);


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


		yPositionScale.domain([0, 200]);

		var nested = d3.nest()
			.key( function(d) {
				return d.activityStartTime.getFullYear();
			})
			.entries(datapoints);


		// console.log(nested);
		var aggregates = create_new_datapoints(nested);

		var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

		console.log(nested);

		// Draw your lines
		// When coloring them, an if statement might come in handy!
		svg.selectAll(".run-lines")
			.data(aggregates)
			.enter().append("path")
			.attr("d", function(d) {
				// it's a function because each d (shape of path) is different
				console.log(d);
				// all of our data points seem to be hiding in d.values
				// because that's just what d3.nest does and it puts the
				// name of the group in d.key
				console.log(d.values);
				// so let's feed our line function d.values
				return line(d.values);
			})
			.attr("fill", function (d) {
				return "none";
			})
			.attr("stroke", function(d){
				return colorScale(d.key);
			})
			.attr("stroke-width", "5")
			.on('mouseover', tip.show)
			.on('mouseout', tip.hide);

		svg.selectAll("text")
			.data(aggregates)
			.enter().append("text")
			.attr("y", function(d) {
					var lastDataPoint = d.values[d.values.length - 1];
					return yPositionScale(lastDataPoint.mileage);
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
			.attr("class", "y axis")
			.call(yAxis)
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text("Kilometers(km)");


	}
})();