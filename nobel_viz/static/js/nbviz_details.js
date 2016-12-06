/* global, $, _, crossfilter, d3 */
(function(nbviz){
  'use strict';

  nbviz.updateList = function(data) {

    var rows, cells;

    // sort the winners' data by year
    var data = data.sort(function(a,b) {
        return +b.year - +a.year;
    });

    rows = d3.select('#nobel-list tbody')
        .selectAll('tr')
        .data(data);

    rows.enter().append('tr')
        .on('click', function(d) {
            console.log("You clicked a row " + JSON.stringify(d));
            nbviz.displayWinner(d);
        });

    // fade out excess rows over 2 seconds
    rows.exit()
        .transition().duration(nbviz.TRANS_DURATION)
        .style('opacity', 0)
        .remove();

    cells = rows.selectAll('td')
        .data(function(d) {
            return [d.year, d.category, d.name];
        });

    // append data cells, then set their property text
    cells = cells.enter().append('td');
    cells.text(function(d) {
        return d;
        });

    // Display a random winner if there is one or more
    if (data.length) {
        nbviz.displayWinner(
            data[Math.floor(Math.random() * data.length)]);
    }
  };


  var infoboxAttrs = ['category', 'year', 'country'];

  nbviz.displayWinner = function(_wData) {

    nbviz.getDataFromAPI('winners/' + _wData._id,
      function(error, wData) {
        if(error){
            return console.warn(error);
        }

        var nw = d3.select('#nobel-winner');
        nw.style('border-color',
                 nbviz.categoryFill(wData.category));

        nw.select('#winner-title').text(wData.name);

        nw.selectAll('.property span')
            .text(function(d) {
                var property = d3.select(this).attr('name');
                return wData[property];
            });
        console.log(wData.bio_image);
        // add the biographic HTML
        nw.select('#biobox').html(wData.mini_bio);
        // Add a image if available otherwise remove the previous one
        if(wData.bio_image){
          nw.select('#picbox img')
            .attr('src', 'static/images/winners/'
                + wData.bio_image)
            .style('display', 'inline');
        }
        else {
          nw.select('#picbox img').style('display', 'none');
        }

        nw.select('#readmore a').attr('href',
            'http://en.wikipedia.org/wiki/' + wData.name);
        console.log(nw);
        } // end anonymous function
      );



    };




}(window.nbviz = window.nbviz || {}))