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

    var colorScale = d3.scaleOrdinal().domain(["Running", "Cardio", "Treadmill Running", "Strength Training"])
        .range(["#b3e2cd", "#fdcdac", "#cbd5e8", "#f4cae4"]);//, "#e6f5c9", "#fff2ae"]);


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

        var timeCalories = datapoints.map(function (d) {
            return d.activityStartTime;
        });
        // console.log(activities);
        xPositionScale.domain(timeCalories);

        var maxCalories = d3.max(datapoints, function (d) {
            return d.calories;
        });
        yPositionScale.domain([0, maxCalories]);

        svg.selectAll(".bar")
            .data(datapoints)
            .enter()
            .append("rect")
            .attr("class", function (d) {
                var curr_activity = d.activityType.toLowerCase().split(" ");
                if (curr_activity[0] == "running") {
                    return "bar running twenty" + d.activityStartTime.getFullYear().toString().slice(-2);
                } else if (curr_activity[0] == "strength") {
                    return "bar strength twenty" + d.activityStartTime.getFullYear().toString().slice(-2);
                }
                else if (curr_activity[0] == "cardio") {
                    return "bar cardio twenty" + d.activityStartTime.getFullYear().toString().slice(-2);
                }
                else {
                    return "bar treadmill twenty" + d.activityStartTime.getFullYear().toString().slice(-2);
                }
            })
            .attr("x", function (d) {
                // console.log(d);
                return xPositionScale(d.activityStartTime);
            })
            .attr("y", function (d) {
                return yPositionScale(d.calories);
            })
            .attr("width", xPositionScale.bandwidth())
            .attr("height", function (d) {
                return height - yPositionScale(d.calories);
            })
            .attr("fill", function(d){
                // console.log(colorScale(d.activityType));
                return colorScale(d.activityType);
            });

        d3.select("#chart_2b_xlabel").text("Cumulative 2012-16");


        svg.append("g")
            .attr("class", "legendOrdinal")
            .attr("transform", "translate(560,20)");

        var legendOrdinal = d3.legendColor()
        //d3 symbol creates a path-string, for example
        //"M0,-8.059274488676564L9.306048591020996,
        //8.059274488676564 -9.306048591020996,8.059274488676564Z"
            .shape("path", d3.symbol().type(d3.symbolSquare).size(150)())
            .shapePadding(10)
            .scale(colorScale);

        svg.select(".legendOrdinal")
            .call(legendOrdinal);

        // Activity for all the buttons
        // cur_selection variable is used for the sorting of elements
        var cur_selection = "bar";

        // BUTTON METHOD ONE: Classes
        d3.select("#btn_all").on('click', function (d) {
            cur_selection = "bar";
            d3.select("#chart_2b_xlabel").text("Cumulative 2012-16");
            redraw("bar", false);
        });

        d3.select("#btn_twenty16").on('click', function (d) {
            cur_selection = "twenty16";
            d3.select("#chart_2b_xlabel").text("Workouts 2016 ");

            redraw("twenty16", false);
        });

        d3.select("#btn_twenty15").on('click', function (d) {
            cur_selection = "twenty15";
            d3.select("#chart_2b_xlabel").text("Workouts 2015 ");

            redraw("twenty15", false);
        });

        d3.select("#btn_twenty14").on('click', function (d) {
            cur_selection = "twenty14";
            d3.select("#chart_2b_xlabel").text("Workouts 2014 ");

            redraw("twenty14", false)
        });

        d3.select("#btn_twenty13").on('click', function (d) {
            cur_selection = "twenty13";
            d3.select("#chart_2b_xlabel").text("Workouts 2013 ");

            redraw("twenty13", false);
        });

        d3.select("#btn_twenty12").on('click', function (d) {
            cur_selection = "twenty12";
            d3.select("#chart_2b_xlabel").text("Workouts 2012 ");

            redraw("twenty12", false)
        });

        d3.selectAll(".sort_it").on('change', function() {
            if(this.checked) {
                redraw(cur_selection, true);
            }
            else{
                redraw(cur_selection, false);
            }
        });

        // Set up our x axis
        var xAxis = d3.axisBottom(xPositionScale).tickFormat(d3.timeFormat("%Y"));

        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll("text").remove();

        // set up our y axis
        var yAxis = d3.axisLeft(yPositionScale);

        svg.append("g")
            .attr("class", "y-axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Calories Burnt");

        function redraw(year_value, isSortedChecked) {
            var classname = "";

            if (year_value.slice(0, 6) == "twenty"){
                classname = ".bar ." + year_value;
            }else{
                classname = ".bar";
            }
            // console.log(classname);
            // console.log(year_value.slice(-2));

            var redrawDataPoints = datapoints.filter( function(d) {
                return d.activityStartTime.getFullYear().toString().slice(-2) == year_value.slice(-2);
            });

            if (redrawDataPoints.length == 0){
                redrawDataPoints = datapoints;
            }

            if (isSortedChecked){
                redrawDataPoints = redrawDataPoints.sort(function(a, b) {
                    return b.calories - a.calories;
                });
            }else{
                redrawDataPoints = redrawDataPoints.sort(function(a, b) {
                    return b.activityStartTime - a.activityStartTime;
                })
            }

            // console.log("Data points are");
            // console.log(redrawDataPoints);
            // console.log(redrawDataPoints.length);

            var timeCalories = redrawDataPoints.map(function (d) {
                return d.activityStartTime;
            });
            xPositionScale.domain(timeCalories);

            svg.select(".x-axis")
            // .transition()
            // .delay(function(d,i){
            //     return i*50;
            // })
            // .duration(500)
                .call(xAxis)
                .selectAll("text").remove();

            var bars = svg.selectAll(".bar")
                .data(redrawDataPoints);

            // console.log(svg);
            //
            // console.log("bars is", bars.size());
            // console.log("bars.enter is", bars.enter().size());
            // console.log("bars.exit is", bars.exit().size());

            // follow the update pattern on
            // https://bl.ocks.org/mbostock/3808218

            bars.enter().append("rect")
                .merge(bars)
                .transition()
                .delay(function(d,i){
                    return i*5;
                })
                .duration(500)
                .attr("class", function (d) {
                    var curr_activity = d.activityType.toLowerCase().split(" ");
                    if (curr_activity[0] == "running") {
                        return "bar running twenty" + d.activityStartTime.getFullYear().toString().slice(-2);
                    } else if (curr_activity[0] == "strength") {
                        return "bar strength twenty" + d.activityStartTime.getFullYear().toString().slice(-2);
                    }
                    else if (curr_activity[0] == "cardio") {
                        return "bar cardio twenty" + d.activityStartTime.getFullYear().toString().slice(-2);
                    }
                    else {
                        return "bar treadmill twenty" + d.activityStartTime.getFullYear().toString().slice(-2);
                    }
                })
                .attr("x", function (d) {
                    // console.log(d);
                    return xPositionScale(d.activityStartTime);
                })
                .attr("y", function (d) {
                    return yPositionScale(d.calories);
                })
                .attr("width", xPositionScale.bandwidth())
                .attr("height", function (d) {
                    return height - yPositionScale(d.calories);
                })
                .attr("fill", function(d){
                    //console.log(colorScale(d.activityType));
                    return colorScale(d.activityType);
                });


            // exit
            bars.exit()
                .transition()
                .duration(500)
                .remove();

        }

    }
})();