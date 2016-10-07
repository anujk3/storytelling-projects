(function() {
    var margin = { top: 30, left: 100, right: 30, bottom: 30},
        height = 400 - margin.top - margin.bottom,
        width = 780 - margin.left - margin.right;

    console.log("Building chart 2");

    var svg = d3.select("#chart-2")
        .append("svg")
        .attr("height", height + margin.top + margin.bottom)
        .attr("width", width + margin.left + margin.right)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var tip = d3.tip()
		.attr('class', 'd3-tip')
		.offset([-10, 0])
		.html(function(d) {
			return "<strong>Calories Burnt:</strong> <span style='color:red'>" + d.calories + "</span><br>" +
				"<strong>Day of Workout:</strong> <span style='color:blue'>" + d.activityStartTime + "</span>";
		});

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

		for (i in nested){
			console.log(i);
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

	var colorScale = d3.scaleOrdinal().range(['#79C887', '#BFB0D1', '#FFBF8F', 'lightblue']);
	//var colorScale = d3.scaleLinear().range(["pink", 'lightblue']);

	var radius = 100;

	var arc = d3.arc()
		.outerRadius(radius)
		.innerRadius(0);

	var labelArc = d3.arc()
		.outerRadius(radius+20)
		.innerRadius(radius+10);

	var pie = d3.pie()
		.value(function(d) {
			return d.totalmins;
		});

	svg.call(tip);

	d3.queue()
        .defer(d3.csv, "check.csv", function(d) {
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

        console.log(nested);

		var aggregates = create_new_datapoints(nested);
		console.log(aggregates);
		// The pie generator is going to convert
		// our datapoints into a series of
		// start and end angles
		console.log("Using our pie generator");
		console.log(pie(aggregates));

		// When using the pie generator
		// bind your pie(datapoints), not
		// just your datapoints

        var pieContainer = svg
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");


        var g = pieContainer.selectAll(".arc")
            .data(pie(aggregates))
            .enter().append("g")
            .attr("class", "arc");

        g.append("path")
            .attr("d", arc)
            .style("fill", function(d) { return colorScale(d.data.totalmins); })
			.on('mouseover', tip.show)
			.on('mouseout', tip.hide);

		g.append("text")
			.attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
			.attr("dy", "0.35em")
			.text(function(d) { return d.data.activity; })
			.attr("text-anchor", function(d) {
				if(d.startAngle > Math.PI) {
					return "end"
				} else {
					return "start"
				}
			});


    }
})();