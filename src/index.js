// add any imports if needed, or write your script directly in this file.
 const Chart = require('chart.js');

 var query    = {
   "from": "Gene",
   "select": [
     "symbol",
     "name",
     "primaryIdentifier",
     "secondaryIdentifier",
     "organism.name",
     "probes.probeResults.sample.structure.identifier",
     "probes.probeResults.sample.structure.name",
     "probes.probeResults.expressionValue"
   ],
   "orderBy": [
     {
       "path": "symbol",
       "direction": "ASC"
     }
   ],
   "where": [
     {
       "path": "Gene.id",
       "op": "=",
       "code": "A"
     }
   ]
 };


// make sure to export main, with the signature
function main(el, service, imEntity, state = {}, config) {
	if (!el || !service || !imEntity || !state || !config) {
		throw new Error('Call main with correct signature');
	}

	query.where[0].value = imEntity.value;

		//load data and format it
    var expression = new imjs.Service(service)
        .records(query)
        .then(function(response) {
        console.log(response)
				//format data for chartjs
				formatDataForChart(response);
    });

		//makes a dummy chart. replace with real chart when my data are shaped right
		var theChart = document.createElement("canvas");
		el.appendChild(theChart);
		var ctx = theChart.getContext('2d'),
		barChart =new Chart(ctx, {
    type: 'horizontalBar',
    data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});

}

function formatDataForChart(data) {
	var data = data[0], //only ever one gene returned per id
		chartData = {
			type : "horizontalBar"
		},
		regionData = {};



	//this is a debug line. remove it later please
	window.data = data;
	//iterate through the results and aggregate the data by brain region name.
	//later each region will form a bar, and the bar length will depend on the
	//MEAN expression level, across all results per brain region.
	// we'll calculate the mean once we've aggregated all the data
	data.probes.map(function(probe) {
		probe.probeResults.map(function(probeResult){
			var brainRegion = probeResult.sample.structure.name;
			//initialise each brain region entry
			if (! regionData[brainRegion]) {
				 regionData[brainRegion] = {
					 values: [probeResult],
					 mean: null,
					 stdev : null,
					 sampleEvidence : null
				 };
			// if a brain region already has at least one result, just add
			// to the array of results, rather than creating a new entry
			} else {
				regionData[brainRegion].values.push(probeResult);
			}
		});
	});

	//Now calculate the mean of each brain region's expression results
	//as well as the standard deviation and the percentage of result with
	//a non-null answer.
	const regions = Object.keys(regionData);
	regions.map(function(region){
		var myRegion = regionData[region];
		myRegion.mean =
	});

	window.regionData = regionData;
}


// Modified from
// https://derickbailey.com/2014/09/21/calculating-standard-deviation-with-array-map-and-array-reduce-in-javascript/
function standardDeviation(values){
	//leaving the nulls in makes the results odd
	values =removeNulls(values);
  var avg = average(values);

  var squareDiffs = values.map(function(value){
    var diff = value - avg;
    var sqrDiff = diff * diff;
    return sqrDiff;
  });

  var avgSquareDiff = average(squareDiffs);

  var stdDev = Math.sqrt(avgSquareDiff);
  return stdDev;
}

//also modified from
//https://derickbailey.com/2014/09/21/calculating-standard-deviation-with-array-map-and-array-reduce-in-javascript/
function average(data){
  var sum = data.reduce(function(sum, value){
    return sum + value;
  }, 0);

  var avg = sum / data.length;
  return avg;
}

function removeNulls(values){
	return values.filter(value => !null);
}

//this calculates the percentage of results in a region that are non-nulls
function countNotNullPercentage(values){
		const notNullCount = removeNulls(values).length;
		return notNullCount * 100 / values.length;
}

module.exports = { main };
