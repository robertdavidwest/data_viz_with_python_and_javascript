/* global $, _, crossfiler, d3 */
//(function(nbviz){
//  'use strict';

  var chartHolder = d3.select("#nobel-time");

  var margin = {top:20, right:20, bottom:30, left:40};
  var boundingRect = chartHolder.node().getBoundingClientRect();
  var width = boundingRect.width - margin.left - margin.right;
  var height = boundingRect.height - margin.top - margin.bottom;

  var svg = chartHolder.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

  var xScale = d3.scale.ordinal()
    .rangeRoundBands([0, width], 0.1)
    .domain(d3.range(1900, 2016)); // years of Nobel-prize

  var yScale = d3.scale.ordinal()
    .rangeRoundBands([height, 0])
    .domain(d3.range(15)); // from 0 to max, in any one year

  var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom")
    .tickValues(xScale.domain().filter(
      function(d,i){
        return !(d%10); })
    );

  svg.append("g")  // group to hold the axis
    .attr('class', "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", function(d) { return "rotate(-65)"; });

  var catLabels = chartHolder.select('svg').append('g')
    .attr("transform", "translate(10, 10)")
    .attr('class', 'labels')
    .selectAll('label').data(nbviz.CATEGORIES)
    .enter().append('g')
    .attr('transform', function(d,i) {return "translate(0," + i * 10 +")";});

  catLabels.append('circle')
    .attr('fill', (nbviz.categoryFill))
    .attr('r', xScale.rangeBand()/2);

  catLabels.append("text")
    .text(function(d) { return d;})
    .attr('dy', '0.4em')
    .attr('x', 10);



 var somedata = [
    {"year":1910,"name":"Wilhelm Conrad R\\u00f6ntgen", 'category': 'Economics'},
    {"year":1910,"name":"Jacobus Henricus van \'t Hoff", 'category': 'Chemistry'},
    {"year":1910,"name":"Sully Prudhomme", 'category': 'Economics'},
    {"year":1911,"name":"Fr\\u00e9d\\u00e9ric Passy", 'category': 'Chemistry'},
    {"year":1912,"name":"Henry Dunant", 'category': 'Economics'},
    {"year":1912,"name":"Emil Adolf von Behring", 'category': 'Economics'},
    {"year":1912,"name":"Theodor Mommsen", 'category': 'Economics'},
    {"year":1912,"name":"Hermann Emil Fischer", 'category': 'Physics'}
  ];




  var nestDataByYear = function(entries) {
    return nbviz.data.years = d3.nest()
      .key(function(w) {
        return w.year
      })
      .entries(entries);

  };

//} (window.nbviz = window.nbiz || {}));


nbviz.updateTimeChart = function(data) {
  var years = svg.selectAll(".year")
    .data(data, function(d) {
      return d.key;
    });

  years.enter().append('g')
    .classed('year', true)
    .attr('name', function(d) { return d.key; })
    .attr("transform", function(year) {
      return "translate(" + xScale(+year.key) + ",0)";
    });

  years.exit().remove();

  var winners = years.selectAll(".winner")
    .data(function(d) {
      return d.values;
    }, function(d) {
      return d.name;
    });

  winners.enter().append('circle')
    .classed('winner', true)
    .attr('fill', function(d) {
      return nbviz.categoryFill(d.category);
    })
    .attr('cy', height)
    .attr('cx', xScale.rangeBand()/2)
    .attr('r', xScale.rangeBand()/2);

  winners
    .transition().duration(2000)
    .attr('cy', function(d, i) {
      return yScale(i);
    });

  winners.exit().remove();
}


nbviz.updateTimeChart(nestDataByYear(somedata))