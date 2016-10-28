(function() {
    var margin = { top: 30, left: 30, right: 30, bottom: 30},
        height = 400 - margin.top - margin.bottom,
        width = 780 - margin.left - margin.right;

    var xPositionScale = d3.scaleBand()
        .range([0, width])
        .padding(1.1);

    var yPositionScale = d3.scaleLinear()
        .domain([0, 24])
        .range([height, 0]);

    var colorScale = d3.scaleOrdinal().domain(["Running", "Cardio", "Treadmill Running", "Strength Training"])
        .range(["#b3e2cd", "#fdcdac", "#cbd5e8", "#f4cae4"]);//, "#e6f5c9", "#fff2ae"]);


    var svg = d3.select("#chart_2c_bar")
        .append("svg")
        .attr("height", height + margin.top + margin.bottom)
        .attr("width", width + margin.left + margin.right)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.select("#chart_2c_bar")
        .append("br");

    d3.select("#chart_2c_bar")
        .append("br");

    d3.select("#chart_2c_bar")
        .append("br");

    d3.select("#chart_2c_bar")
        .append("div")
        .attr("id", "slider");


    $("#slider").dateRangeSlider();

    // Create a time parser
    var parseDate = d3.timeParse("%Y-%m-%d");// %H:%M:%S");

    d3.queue()
        .defer(d3.csv, "check.csv", function(d) {
            // While we're reading the data in, parse each date
            // into a datetime object so it isn't just a string
            // save it as 'd.datetime'
            // d.datetime is now your 'useful' date, you can ignore
            // d.Date. Feel free to use console.log to check it out.

            d.startTime  = d.startTime.split(" ");
            d.timeofDay = d.startTime[1];

            d.dateOfEvent = parseDate(d.startTime[0]);
            d.avgHR = +d.avgHR;
            d.avgSpeed = +d["avgSpeed(min/km)"];
            d.calories = +d.calories;
            d.distance = +d.distance;
            d.elevationGain = +d.elevationGain;
            d.maxHR = +d.maxHR;
            d.totalMins = +d.totalMins;
            return d;
        })
        .await(ready);

    function ready(error, datapoints) {

        // console.log(datapoints);
        //
        // datapoints = datapoints.slice(0, 20);
        // console.log(datapoints);
        datapoints = datapoints.sort(function(a, b){
            return a.dateOfEvent - b.dateOfEvent;
        });

        var allDates = datapoints.map(function (d) {
            return d.dateOfEvent;
        });
        xPositionScale.domain(allDates);


        var minDateEvent = d3.min(datapoints, function(d) { return d.dateOfEvent });
        var maxDateEvent = d3.max(datapoints, function(d) { return d.dateOfEvent });

        // Set date option
        $("#slider").dateRangeSlider({
            bounds: {min: new Date(minDateEvent), max: new Date(maxDateEvent)}
        });
        $("#slider").dateRangeSlider("values", new Date(minDateEvent), new Date(maxDateEvent));

        var counter = 0;
        var minDate;
        var maxDate;

        $("#slider").bind("valuesChanged", function(e, data){
            counter = counter + 1;
            if (counter == 1){
                console.log("First time");
                minDate = data.values.min;
                maxDate = data.values.max;
            }else{
                // console.log("Values just changed. min: " + data.values.min + " max: " + data.values.max);
                minDate = data.values.min;
                maxDate = data.values.max;
                redrawCircles(data.values.min, data.values.max);
            }
        });

        var totalMinsMin = d3.min(datapoints, function(d) { return d.totalMins });
        var totalMinsMax = d3.max(datapoints, function(d) { return d.totalMins });
        var totalMinsScale = d3.scaleSqrt().domain([totalMinsMin, totalMinsMax]).range([7, 20]);

        svg.selectAll(".workout-circle")
            .data(datapoints)
            .enter().append("circle")
            .attr("class", "workout-circle")
            .attr("r", function(d){
                return totalMinsScale(d.totalMins);
            })
            .attr("cx", function(d) {
                return xPositionScale(d.dateOfEvent);
            })
            .attr("cy", function(d) {
                var time = d.timeofDay.split(":");
                var timeofDay = +(time[0] + "." + time[1]);
                return yPositionScale(timeofDay);
            })
            .attr("fill", function(d) {
                return colorScale(d.activityType);
            });


        var xAxis = d3.axisBottom(xPositionScale).tickFormat(d3.timeFormat("%m-%d-%y"));

        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll("text").remove();


        var yAxis = d3.axisLeft(yPositionScale);
        svg.append("g")
            .attr("class", "axis y-axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("fill", "black")
            .style("text-anchor", "end")
            .text("Time of the Day");

        // BUTTON METHOD ONE: Classes

        var cur_selection = "cumulative";

        d3.select("#btn_cumulative").on('click', function (d) {
            cur_selection = "cumulative";
            redrawCircles(minDate, maxDate);
        });


        d3.select("#btn_strength").on('click', function (d) {
            cur_selection = "strength";
            redrawCircles(minDate, maxDate);
        });

        d3.select("#btn_cardio").on('click', function (d) {
            cur_selection = "cardio";
            redrawCircles(minDate, maxDate);
        });

        d3.select("#btn_running").on('click', function (d) {
            cur_selection = "running";
            redrawCircles(minDate, maxDate);
        });

        d3.select("#btn_treadmill").on('click', function (d) {
            cur_selection = "treadmill";
            redrawCircles(minDate, maxDate);
        });



        function redrawCircles(minDate, maxDate){

            // console.log(cur_selection);

            var updatedPoints;

            var copyUpdatedPoints = datapoints.filter(function(d) {
                if ((d.dateOfEvent >= minDate) && (d.dateOfEvent <= maxDate)) {
                    return d;
                }
            });

            if (cur_selection == "cumulative"){
                updatedPoints = datapoints.filter(function(d){
                    if ((d.dateOfEvent >= minDate) && (d.dateOfEvent <= maxDate)){
                        return d;
                    }
                });
            }else {
                updatedPoints = datapoints.filter(function (d) {
                    if ((d.dateOfEvent >= minDate) && (d.dateOfEvent <= maxDate) && (d.activityType.split(" ")[0].toLowerCase() == cur_selection)) {
                        return d;
                    }
                });
            }
            // console.log(updatedPoints.length);
            // console.log(updatedPoints);

            var updatedDates = copyUpdatedPoints.map(function (d) {
                return d.dateOfEvent;
            });

            // console.log(updatedDates);

            xPositionScale.domain(updatedDates);

            svg.select(".x-axis")
                .transition()
                .call(xAxis)
                .selectAll("text").remove();

            var points = svg.selectAll(".workout-circle")    // if u do d3.selectAll, will select from the complete page
                .data(updatedPoints);

            // console.log(points.enter());
            // console.log(points.exit());
            // console.log(points.update());

            points.enter().append("circle") // append circles for the NEW ones
                .merge(points) // combine it with the EXISTING ones
                .transition()
                .duration(500)
                .attr("class", "workout-circle") // and now we can set r and cx etc
                .attr("r", function(d){
                    return totalMinsScale(d.totalMins);
                })
                .attr("cx", function(d) {
                    return xPositionScale(d.dateOfEvent);
                })
                .attr("cy", function(d) {
                    var time = d.timeofDay.split(":");
                    var timeofDay = +(time[0] + "." + time[1]);
                    return yPositionScale(timeofDay);
                })
                .attr("fill", function(d) {
                    return colorScale(d.activityType);
                });

            points.exit().remove()
        }
    }
})();