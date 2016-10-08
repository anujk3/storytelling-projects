(function() {
	var margin = { top: 30, left: 50, right: 50, bottom: 30},
		height = 400 - margin.top - margin.bottom,
		width = 780 - margin.left - margin.right;

	console.log("Building chart 4");

	var svg = d3.select("#chart_4a_pie")
		.append("svg")
		.attr("height", height + margin.top + margin.bottom)
		.attr("width", width + margin.left + margin.right)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var tip = d3.tip()
		.attr('class', 'd3-tip')
		.offset([-10, 0])
		.html(function(d) {
			return "<strong>Activity:</strong> <span style='color:red'>" + d.data.activity + "</span><br>";
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
		console.log(nested);
		var aggregates = [];
		var element = {"Cardio":0, "Running":0, "Strength Training":0, "Treadmill Running":0};

		for (i=0;i < nested.length; i++){
			element[nested[i].activityType] = element[nested[i].activityType] + parseFloat(nested[i].timemins);
		}
		console.log(element);

		for (var key in element){
			var element_to_push = {};
			element_to_push.activity = key;
			element_to_push.totalmins = element[key];

			aggregates.push(element_to_push);
		}
		// console.log(aggregates);
		return aggregates;
	}

	var colorScale = d3.scaleOrdinal().range(['#79C887', '#BFB0D1', '#FFBF8F', 'lightblue']);

	var xPositionScale = d3.scalePoint()
		.range([0, width])
		.padding(0.1);

	var radius = 60;

	var arc = d3.arc()
		.outerRadius(radius)
		.innerRadius(0);

	var labelArc = d3.arc()
		.outerRadius(radius+10)
		.innerRadius(radius+10);

	var pie = d3.pie()
		.value(function(d) {
			return d.totalmins;
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
		// Get the max and min of datetime and Close,
		// then use that to set the domain of your scale

		// console.log(datapoints);

		var nested = d3.nest() // fire up d3.nest
			.key(function(d) { // group them by activity type
				return d.activityStartTime.getFullYear();
			})
			.entries(datapoints);// and here is our data

		console.log(nested);
		var yearData = nested.map( function(d) { return d.key });
		xPositionScale.domain(yearData);


		var charts = svg.selectAll(".pie-charts")
			.data(nested)
			.enter().append("g")
			.attr("transform", function(d) {
				var yPos = height/2;
				var xPos = xPositionScale(d.key);
				return "translate(" + xPos + "," + yPos + ")"
			});

		charts.append("text")
			.attr("x", 0)
			.attr("y", +100)
			.attr("text-anchor", "middle")
			.text(function(d) {
				return d.key
			});


		charts.each(function(d) {
			var projectData = d.values;
			var aggregates = create_new_datapoints(projectData);
			console.log(aggregates);
			var g = d3.select(this);

			g.selectAll("path")
				.data(pie(aggregates))
				.enter().append("path")
				.attr("d", arc)
				.attr("fill", function(d) {
					return colorScale(d.data.activity);
				})
				.on('mouseover', tip.show)
				.on('mouseout', tip.hide);
		})

	}
})();