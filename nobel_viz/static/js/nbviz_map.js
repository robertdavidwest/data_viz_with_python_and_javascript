/* global $, _, crossfiler, d3 */
(function(nbviz){
  'use strict';


    var margin = {top:20, right:20, bottom:30, left:40};

    // DIMENSIONS AND SVG
    var mapContainer = d3.select('#nobel-map');
    var boundingRect = mapContainer.node().getBoundingClientRect();
    var width = boundingRect.width - margin.left - margin.right;
    var height = boundingRect.height - margin.top - margin.bottom;
    
    var svg = mapContainer.append('svg');







    // OUR CHOSEN PROJECTION
    var projection = d3.geo.equirectangular()
        .scale(193 * (height/480))
        .center([15,15])
        .translate([width / 2, height / 2])
        .precision(.1);

    // CREATE PATH WITH PROJECTION
    var path = d3.geo.path()
        .projection(projection);

    // ADD GRATICULE
    var graticule = d3.geo.graticule();
    
    svg.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", path);


    var getCentroid = function(d) {
        var latlng = nbviz.data.nationalData[d.name].latlng;
        return projection([latlng[1], latlng[0]]);
    };

    // A RADIUS SCALE FOR OUR CENTROID INDICATORS
    var radiusScale = d3.scale.sqrt()
        .range([nbviz.MIN_CENTROID_RADIUS, nbviz.MAX_CENTROID_RADIUS]);

    // OBJECT TO MAP COUNTRY-NAME TO GEOJSON OBJECT
    var cnameToCountry = {};

    // INITIAL MAP CREATION, USING DOWNLOADED MAP-DATA
    nbviz.initMap = function(world, names) {

        // EXTRACT OUR REQUIRED FEATURES FROM THE TOPOJSON
        var land = topojson.feature(world, world.objects.land);
        var countries = topojson.feature(world, world.objects.countries).features;

        var borders = topojson.mesh(world, world.objects.countries,
                                        function(a, b) { return a !== b; });

        // MAIN WORLD MAP
        svg.insert("path", ".graticule")
            .datum(land)
            .attr("class", "land")
            .attr("d", path);

        // COUNTRIES PATHS
        svg.insert("g", ".graticule")
            .attr("class", 'countries');

        // COUNTRIES VALUE-INDICATORS
        svg.insert("g")
        .attr("class", "centroids");

        // BOUNDRY LINES
        svg.insert("path", ".graticule")
            .datum(borders)
            .attr("class", "boundary")
            .attr("d", path);

        // CREATE OBJECT MAPPING COUNTRY-NAMES TO GEOJSON SHAPES
        var idToCountry = {};
        countries.forEach(function(c) {
            idToCountry[c.id] = c;
        });

        names.forEach(function(n) {
            cnameToCountry[n.name] = idToCountry[n.id];
        });

    };

    // DRAW MAP ON DATA-LOAD
    //nbviz.drawMap(world, names, countryData);

    var tooltip = d3.select('#map-tooltip');
    nbviz.updateMap = function(countryData) {
        var mapData = countryData
            .filter(function(d) {
                return d.value > 0;
            })
            .map(function(d) {
              return {
                geo: cnameToCountry[d.key],
                name: d.key,
                number: d.value
              };
            });

        var sc = d3.scale.sqrt().domain([0, 100]).range([0, 5]);
        var radiusScale = d3.scale.sqrt()
            .range([nbviz.MIN_CENTROID_RADIUS, nbviz.MAX_CENTROID_RADIUS]);


        var maxWinners = d3.max(mapData.map(function(d) {
            return d.number;
        }));

        // DOMAIN OF VALUE-INDINCATOR SCALE
        radiusScale.domain([0, maxWinners]);

        // BIND MAP-DATA TO THE COUNTRY PATHS USING THE NAME KEY
        var countries = svg.select('.countries').selectAll('.country')
        .data(mapData, function(d) {
            return d.name;
        });

        // ENTER AND APPEND ANY NEW COUNTRIES
        countries.enter()
            .append('path')
            .attr('class', 'country')
            .on('mouseenter', function(d) {
                // console.log('Entered ' + d.name);

                var country = d3.select(this);
                // don't do anything if the country is not visible
                if(!country.classed('visible')){ return; }

                // get the country data object
                var cData = country.datum();
                // if only one prize, use singular `prize'
                var prize_string = (cData.number === 1)?
                ' prize in ': ' prizes in ';
                // set the header and text of the tooltip
                tooltip.select('h2').text(cData.name);
                tooltip.select('p').text(cData.number
                + prize_string + nbviz.activeCategory);
                // set the border color according to selected prize category
                var borderColor = (nbviz.activeCategory === nbviz.ALL_CATS)?
                'goldenrod':nbviz.categoryFill(nbviz.activeCategory);
                tooltip.style('border-color', borderColor);
                var mouseCoords = d3.mouse(this);
                var w = parseInt(tooltip.style('width')),
                h = parseInt(tooltip.style('height'));
                tooltip.style('top', (mouseCoords[1] - h) + 'px');
                tooltip.style('left', (mouseCoords[0] - w/2) + 'px');
                d3.select(this).classed('active', true);
            })

            .on('mouseout', function(d) {

                tooltip.style('left', '-9999px');

                // console.log('Left ' + d.name);
                d3.select(this).classed('active', false);
            });

        // UPDATE ALL BOUND COUNTRIES
        countries
        .attr('name', function(d) {
        return d.name;
        })
        .classed('visible', true)
        .transition().duration(nbviz.TRANS_DURATION)
        .style('opacity', 1)
        .attr('d', function(d) {
        return path(d.geo);
        });

        // REMOVE ANY UNBOUND COUNTRIES
        countries.exit()
        .classed('visible', false)
        .transition().duration(nbviz.TRANS_DURATION)
        .style('opacity', 0);

        // BIND MAP-DATA WITH NAME KEY
        var centroids = svg.select('.centroids')
            .selectAll(".centroid")
            .data(mapData, function(d) {
            return d.name;
        });

        // ENTER TO APPEND INDICATORS
        centroids.enter().append('circle')
            .attr("class", "centroid");

        // UPDATE RADIUS AND OPACITY OF INDICATORS
        centroids.attr("name", function(d) {
            return d.name;
        })
        .attr("cx", function(d) {
        return getCentroid(d)[0];
        })
        .attr("cy", function(d) {
        return getCentroid(d)[1];
        })
        .classed('active', function(d) {
        return d.name === nbviz.activeCountry;
        })
        .transition().duration(nbviz.MAP_DURATION)
        .style('opacity', 1)
        .attr("r", function(d) {
        return radiusScale(+d.number);
        });

        // MAKE UNBOUND INDICATORS INVISIBLE
        centroids.exit()
        .style('opacity', 0);

    };

}(window.nbviz = window.nbviz || {}));