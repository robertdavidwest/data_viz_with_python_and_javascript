var API_URL = 'http://127.0.0.1:5000/api';


var displayJSON = function(query){
    d3.json(API_URL + query, function(error, data){

        // log any error to the console as a warning
        if (error){
            console.warn(error);
        }

        d3.select("#query pre").html(query);
        d3.select("#data pre").html(JSON.stringify(data, null, 4));
        console.log(data);
    });
};

var query = '/winners_clean?where=' + JSON.stringify({
    "year": {"$gt": 2000},
    "gender": "female"
});