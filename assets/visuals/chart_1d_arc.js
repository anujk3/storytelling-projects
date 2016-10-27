(function() {
    var margin = { top: 30, left: 30, right: 30, bottom: 30},
        height = 400 - margin.top - margin.bottom,
        width = 540 - margin.left - margin.right;

    console.log("Building chart 1d_arc");

    var svg = d3.select("#chart_1d_arc")
        .append("svg")
        .attr("height", height + margin.top + margin.bottom)
        .attr("width", width + margin.left + margin.right)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    // Interactivity added using http://zeroviscosity.com/d3-js-step-by-step/step-6-animating-interactivity

    var dataset = [
        { label: 'Running', count: 8739 , enabled: true},
        { label: 'Strength Training', count: 15332 , enabled: true},
        { label: 'Cardio', count: 1409 , enabled: true},
        { label: 'Treadmill Running', count: 444 , enabled: true}
    ];


    var radius = Math.min(width, height) / 2;
    var donutWidth = 75;
    var legendRectSize = 18;                                  // NEW
    var legendSpacing = 4;                                    // NEW

    var color = d3.scaleOrdinal(d3.schemeCategory20);


    var arc = d3.arc()
        .innerRadius(radius - donutWidth)
        .outerRadius(radius);

    var pie = d3.pie()
        .value(function(d) { return d.count; })
        .sort(null);

    var tooltip = d3.select('#chart_1d_arc')                               // NEW
        .append('div')                                                // NEW
        .attr('class', 'tooltip1');                                    // NEW
    tooltip.append('div')                                           // NEW
        .attr('class', 'label1');                                      // NEW
    tooltip.append('div')                                           // NEW
        .attr('class', 'count');                                      // NEW
    tooltip.append('div')                                           // NEW
        .attr('class', 'percent');                                    // NEW

    var pieContainer = svg.append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");


    var path = pieContainer.selectAll('path')
        .data(pie(dataset))
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', function(d, i) {
            return color(d.data.label);
        })
        .each(function(d) { this._current = d; });                // NEW



    path.on('mouseover', function(d) {                            // NEW
        // console.log(d);
        var total = d3.sum(dataset.map(function(d) {                // NEW
            return (d.enabled) ? d.count : 0;                       // UPDATED
        }));                                                        // NEW
        var percent = Math.round(1000 * d.data.count / total) / 10; // NEW
        tooltip.select('.label1').html(d.data.label);                // NEW
        tooltip.select('.count').html(d.data.count + " mins");                // NEW
        tooltip.select('.percent').html(percent + '%');             // NEW
        tooltip.style('display', 'block');                          // NEW
    });                                                           // NEW
    path.on('mouseout', function() {                              // NEW
        tooltip.style('display', 'none');                           // NEW
    });                                                           // NEW
    /* OPTIONAL
     path.on('mousemove', function(d) {                            // NEW
     tooltip.style('top', (d3.event.layerY + 10) + 'px')         // NEW
     .style('left', (d3.event.layerX + 10) + 'px');            // NEW
     });                                                           // NEW
     */



    var legend = pieContainer.selectAll('.legend')                     // NEW
        .data(color.domain())                                   // NEW
        .enter()                                                // NEW
        .append('g')                                            // NEW
        .attr('class', 'legend')                                // NEW
        .attr('transform', function(d, i) {                     // NEW
            var height = legendRectSize + legendSpacing;          // NEW
            var offset =  height * color.domain().length / 2;     // NEW
            var horz = -2 * legendRectSize;                       // NEW
            var vert = i * height - offset;                       // NEW
            return 'translate(' + horz + ',' + vert + ')';        // NEW
        });                                                     // NEW

    legend.append('rect')
        .attr('width', legendRectSize)
        .attr('height', legendRectSize)
        .style('fill', color)
        .style('stroke', color)                                   // UPDATED (removed semicolon)
        .on('click', function(label) {                            // NEW
            var rect = d3.select(this);                             // NEW
            var enabled = true;                                     // NEW
            var totalEnabled = d3.sum(dataset.map(function(d) {     // NEW
                return (d.enabled) ? 1 : 0;                           // NEW
            }));                                                    // NEW
            if (rect.attr('class') === 'disabled') {                // NEW
                rect.attr('class', '');                               // NEW
            } else {                                                // NEW
                if (totalEnabled < 2) return;                         // NEW
                rect.attr('class', 'disabled');                       // NEW
                enabled = false;                                      // NEW
            }                                                       // NEW
            pie.value(function(d) {                                 // NEW
                if (d.label === label) d.enabled = enabled;           // NEW
                return (d.enabled) ? d.count : 0;                     // NEW
            });                                                     // NEW
            path = path.data(pie(dataset));                         // NEW
            path.transition()                                       // NEW
                .duration(750)                                        // NEW
                .attrTween('d', function(d) {                         // NEW
                    var interpolate = d3.interpolate(this._current, d); // NEW
                    this._current = interpolate(0);                     // NEW
                    return function(t) {                                // NEW
                        return arc(interpolate(t));                       // NEW
                    };                                                  // NEW
                });                                                   // NEW
        });                                                       // NEW


    legend.append('text')                                     // NEW
        .attr('x', legendRectSize + legendSpacing)              // NEW
        .attr('y', legendRectSize - legendSpacing)              // NEW
        .text(function(d) { return d; });                       // NEW


})();