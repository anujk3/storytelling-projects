(function() {
	var margin = { top: 30, left: 30, right: 30, bottom: 30},
		height = 400 - margin.top - margin.bottom,
		width = 780 - margin.left - margin.right;

	console.log("Building chart 3");

	var svg = d3.select("#chart_3a_pie")
		.append("svg")
		.attr("height", height + margin.top + margin.bottom)
		.attr("width", width + margin.left + margin.right)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


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

	var xPositionScale = d3.scalePoint()
		.domain(['SchemeCategory10', 'SchemeCategory20', 'SchemeCategory20b', 'SchemeCategory20c'])
		.range([0, width])
		.padding(0.32);

	var colorScale1 = d3.scaleOrdinal(d3.schemeCategory10);
	var colorScale2 = d3.scaleOrdinal(d3.schemeCategory20);
	var colorScale3 = d3.scaleOrdinal(d3.schemeCategory20b);
	var colorScale4 = d3.scaleOrdinal(d3.schemeCategory20c);

	var radius = 80;

	var arc = d3.arc()
		.outerRadius(radius)
		.innerRadius(0);


	var pie = d3.pie()
		.value(function(d) {
			return d.timemins;
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


		var nested = d3.nest() // fire up d3.nest
			.key(function(d) { // group them by activity type
				return d.activityType;
			})
			.entries(datapoints);// and here is our data

		// console.log(nested);

		var schemes = ['SchemeCategory10', 'SchemeCategory20', 'SchemeCategory20b', 'SchemeCategory20c'];

		var charts = svg.selectAll(".pie-charts")
			.data(nested)
			.enter().append("g")
			.attr("transform", function(d, i) {
				var yPos = height/2;
				var xPos = xPositionScale(schemes[i]);
				return "translate(" + xPos + "," + yPos + ")";
			});

		charts.append("text")
			.attr("x", 0)
			.attr("y", +100)
			.attr("text-anchor", "middle")
			.text(function(d, i) {
				return schemes[i];
			});

		charts.each(function(d) {

			if (d.key == "Running"){
				var projectData = d.values;
				var g = d3.select(this);

				g.selectAll("path")
					.data(pie(projectData))
					.enter().append("path")
					.attr("d", arc)
					.attr("fill", function(d) {
						return colorScale1(d.data.timemins);
					});
			} else if (d.key == "Strength Training"){
				var projectData = d.values;
				var g = d3.select(this);

				g.selectAll("path")
					.data(pie(projectData))
					.enter().append("path")
					.attr("d", arc)
					.attr("fill", function(d) {
						return colorScale2(d.data.timemins);
					});
			} else if (d.key == "Cardio"){
				var projectData = d.values;
				var g = d3.select(this);

				g.selectAll("path")
					.data(pie(projectData))
					.enter().append("path")
					.attr("d", arc)
					.attr("fill", function(d) {
						return colorScale3(d.data.timemins);
					});
			} else {
				var projectData = d.values;
				var g = d3.select(this);

				g.selectAll("path")
					.data(pie(projectData))
					.enter().append("path")
					.attr("d", arc)
					.attr("fill", function(d) {
						return colorScale4(d.data.timemins);
					});
			}

		});

	}
})();