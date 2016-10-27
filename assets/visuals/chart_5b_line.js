(function() {
    var margin = { top: 30, left: 30, right: 90, bottom: 30},
        height = 400 - margin.top - margin.bottom,
        width = 780 - margin.left - margin.right;

    console.log("Building chart 5b");

    var svg = d3.select("#chart_5b_line")
        .append("svg")
        .attr("height", height + margin.top + margin.bottom)
        .attr("width", width + margin.left + margin.right)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Create your scales, but ONLY give them a range
    // (you'll set the domain once you read in your data)
    // var xPositionScale = d3.scaleLinear().range([0, width]);

    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    var xPositionScale = d3.scaleLinear().domain([0, 11]).range([0, width-20]);
    var yPositionScale = d3.scaleLinear().range([height, 0]);

    // let's make a color scale!
    var colorScale = d3.scaleOrdinal().domain(["2012", "2013", "2014", "2015", "2016"])
        .range(["red", "orange", "green", "lightblue", "purple"]);

    // Create a d3.line function
    var line = d3.line()
        .x(function(d) {
            return xPositionScale(d.Month.getMonth());
        })
        .y(function(d) {
            return yPositionScale(d.Mileage);
        })
        .curve(d3.curveMonotoneX);

    var monthNumber = d3.timeParse("%-m");

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
            // d.Month = +d.Month;
            d.Month = monthNumber("" + (+d.Month) );

            d.Mileage = +d.Mileage;
            return d;
        })
        .await(ready);

    // Fix up the function definition! It doesn't just get an error...
    function ready(error, datapoints) {

        // console.log(datapoints);

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

        // console.log(nested);

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
                // console.log(monthNames[d.values[0].Month.getMonth()]);
                return line(d.values);
            })
            .attr("fill", "none")
            .attr("stroke", function(d) {
                // console.log("The nested thing looks like", d);
                return colorScale(d.key);
            })
            .attr("stroke-width", "2");

        // Draw your dots
        svg.selectAll(".mileage-circle")
            .data(datapoints)
            .enter().append("circle")
            .attr("r", 3)
            .attr("cx", function(d) {
                return xPositionScale(d.Month.getMonth())
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

        // Create the element that will be our tooltip
        // by default it's hidden with display: none
        // DO NOT GIVE IT THE CLASS TOOLTIP
        // IT WILL CONFLICT WITH SOME BOOTSTRAP THING
        // AND WILL NOT SHOW UP AND YOU'LL BE VERY
        // VERY CONFUSED AND VERY VERY SAD
        var tooltip = svg.append("g")
            .attr("class", "tip")
            .style("display", "none");

        // give the tooltip a circle to highlight our
        // data point
        tooltip.append("circle")
            .attr("r", 7)
            .attr("fill", "gray");

        // give the tooltip a text element, but push
        // it to the right and down little bit
        tooltip.append("text")
            .attr("dx", 5)
            .attr("dy", 15)
            .attr("font-size", 12);

        // draw an invisible rectangle over the ENTIRE page
        // but even though it's invisible, make it catch
        // everything your pointer (mouse) does
        svg.append("rect")
            .attr("fill", "none")
            .style("pointer-events", "all")
            .attr("width", width)
            .attr("height", height)
            .on("mousemove", function(d) {
                // When the mouse is moved on top of the rectangle,
                // compute what the data point is and where to draw it

                // If you'd understand better, console.log all of these variables
                // as we step through the process

                // STEP ONE: Get the position of the mouse - how many pixels
                // to the right is it?
                var mouse = d3.mouse(this);
                var mousePositionX = mouse[0];
                // console.log(mousePositionX);


                // STEP TWO: Use the x position scale BACKWARDS to estimate
                // the number of years for our mouse position
                // if we're 200 pixels out, how many years would that be?
                var mouseMonth = Math.round(xPositionScale.invert(mousePositionX));
                // console.log(mouseMonth);

                // STEP THREE: We have a year, but it's probably not exactly
                // on one of our data points (e.g. mouse is on 1973 but we
                // only have 1970 and 1975). The bisector will take the
                // year we're at and round it down to the closest data point

                // BUT!!!! This seemed complicated enough when we only had
                // one line, but this time we need to do it for each line.
                // Once we have the closest point for each line, we then see
                // which line is the 'right' one to display the tooltip on

                // Making a new list: It's just the closest datapoints
                // for each and every country/line
                var closeDatapoints = nested.map(function(d) {
                    // we find the datapoint closest to our month
                    var index = d3.bisector(function(d) { return d.Month.getMonth(); })
                        .left(d.values, mouseMonth);
                    return d.values[index];
                });

                // console.log(closeDatapoints);

                // STEP FOUR:
                // Now we have a list of datapoints that match on the x axis,
                // but we need to see which one is closest on the y axis, too
                var mousePositionY = mouse[1];
                var mouseKilometers = yPositionScale.invert(mousePositionY);

                // console.log(mouseKilometers);

                // it will only work on sorted datapoints, though, so let's sort first
                var sorted = closeDatapoints.sort(function(a,b) {
                    return a.Mileage - b.Mileage;
                });

                if (sorted[4] === undefined){
                    sorted = sorted.slice(0, 4);
                }
                // console.log(sorted);

                // Use the computed Mileage from the mouse position
                // to find which line's data point we should be using
                var index = d3.bisector(function(d) { return d.Mileage; })
                    .left(sorted, mouseKilometers);

                // console.log(index);

                // // STEP FIVE: Use the index to get the datapoint
                var d = sorted[index];
                if(!d) {
                    d = sorted[index - 1];
                }

                // STEP FIVE: What's the x and y of that datapoint? Let's
                // move the tooltip to there
                var xPos = xPositionScale(d.Month.getMonth());
                var yPos = yPositionScale(d.Mileage);
                // console.log(d);
                d3.select(".tip")
                    .attr("transform", "translate(" + xPos + "," + yPos + ")");

                // STEP FIVE: Use the datapoint information to fill in the tooltip
                var htmlstring = d.Year + "-" + monthNames[d.Month.getMonth()] + "-" + d.Mileage + "km";
                console.log(htmlstring);
                d3.select(".tip").select("text").html(htmlstring);

            })
            .on("mouseout", function(d) {
                // Hide the tooltip when you're moving off of the visulization
                svg.select(".tip").style("display", "none")
            })
            .on("mouseover", function(d) {
                // Display the tooltip when you're over the rectangle
                // why is it null? I dunno, stole it from
                // https://bl.ocks.org/mbostock/3902569
                svg.select(".tip").style("display", null)
            });


        // Add your axes
        var xAxis = d3.axisBottom(xPositionScale);
        svg.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        // STEP THREE: Overwrite d3's labels with your own
        svg.selectAll(".x-axis text").text(function(d) {
            console.log(d);
            switch(d) {
                case 0: return "Jan";
                case 1: return "Feb";
                case 2: return "Mar";
                case 3: return "Apr";
                case 4: return "May";
                case 5: return "Jun";
                case 6: return "Jul";
                case 7: return "Aug";
                case 8: return "Sep";
                case 9: return "Oct";
                case 10: return "Nov";
                case 11: return "Dec";
            }
            return "Unknown";
        });

        var yAxis = d3.axisLeft(yPositionScale);
        svg.append("g")
            .attr("class", "axis y-axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Kilometers(km)");

    }
})();