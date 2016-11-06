

d3.select('#title').classed('fancy-title', true).text("My Bar Chart");

var nobelData = [
{code: 'USA', key:'United States', value:336},
{code: 'GBR', key:'United Kingdom', value:98},
{code: 'DEU', key:'Germany', value:79},
{code: 'FRA', key:'France', value:60},
{code: 'SWE', key:'Sweden', value:29},
{code: 'CHE', key:'Switzerland', value:23},
{code: 'JPN', key:'Japan', value:21},
{code: 'RUS', key:'Russia', value:19},
{code: 'NLD', key:'Netherlands', value:17},
{code: 'AUT', key:'Austria', value:14}
];
console.log(nobelData);

//var buildCrudeBarChart = function() {

var chartHolder = d3.select("#nobel-bar");

var margin = {top: 20, right: 20, bottom: 30, left: 40};
var boundingRect = chartHolder.node().
getBoundingClientRect();

var width = boundingRect.width - margin.left - margin.right;
var height = boundingRect.height - margin.top - margin.bottom;

var X_PADDING_LEFT = 20;
var xScale = d3.scale.ordinal().rangeBands([X_PADDING_LEFT, width], 0.1);
var yScale = d3.scale.linear().rangeRound([height, 0]);

// axes
var xAxis = d3.svg.axis()
.scale(xScale)
.orient("bottom");

var yAxis = d3.svg.axis()
.scale(yScale)
.orient('left')
.ticks(10)
.tickFormat(function(d) { return d; } );

var svg = d3.select("#nobel-bar").append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g").classed('chart', true)
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.append("g")
.attr("class", "x axis")
.attr("transform", "translate(0," + height + ")");

svg.append("g")
.attr("class", "y axis")
.append("text")
.attr("id", 'y-axis-label')
.attr("transform", "rotate(-90)")
.attr("y", 6)
.attr("dy", ".71em")
.style("text-anchor", "end")
.text("Number of Winners");

var update = function(data){
// Update scale domains for changed data
xScale.domain( data.map(function(d) {return d.code; }) );
yScale.domain([0, d3.max(data.map(function(d){return d.value}))]);

// update axes
svg.select('.x.axis')
  .transition().duration(nbviz.TRANS_DURATION)
  .call(xAxis)
  .selectAll("text")
  .style("text-anchor", "end")
  .attr("dx", "-.8em")
  .attr("dy", ".15em")
  .attr("transform", "rotate(-65)");

svg.select('.y.axis')
  .transition().duration(nbviz.TRANS_DURATION)
  .call(yAxis);

// Join data to bar group
var bars = svg.selectAll('.bar').data(data, function(d) {
  return d.code;
});

// append bars for unbound data
bars.enter().append('rect').classed('bar', true);

// update all bars with bound data
bars
  .classed('active', function(d) {
    return d.key === nbviz.activeCountry;
  })
  .transition().duration(nbviz.TRANS_DURATION)
  .attr('height', function(d, i){
      return height-yScale(d.value); })
  .attr('width', xScale.rangeBand())
  .attr('y', function(d) {
      return yScale(d.value); })
  .attr('x', function(d) {
      return xScale(d.code);
});

bars.exit().remove();
};

update(nobelData);

