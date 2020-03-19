//jshint -W104
//jshint -W119

let api = "https://coronavirus-tracker-api.herokuapp.com/all";

fetch(api).then( function(response) {
    return response.json();

}).then( function(data) {

    let totalConfirmed = data.confirmed.latest,
    confirmedLocations = data.confirmed.locations,
    lastUpdate = data.confirmed.last_updated,
    totalDeaths = data.deaths.latest,
    totalRecovered = data.recovered.latest;    

    let casesListEl = document.querySelector('.casesList');
    let deathListEl = document.querySelector('.deathList');
    let recoveryListEl = document.querySelector('.recoveryList');

    let dateObj = new Date(lastUpdate);
    let options = {
        weekday: "long",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric"
    };

    dateObj = dateObj.toLocaleDateString('en', options);

    document.querySelector('#totalConfirmed').innerHTML = addCommasToNumbers( totalConfirmed );
    document.querySelector('#totalDeaths').innerHTML = addCommasToNumbers( totalDeaths );
    document.querySelector('#totalRecovered').innerHTML = addCommasToNumbers( totalRecovered );
    document.querySelector('#lastUpdated').innerHTML += dateObj;

    //declare arrays
    let confirmedArray = [];
    let deathArray = [];
    let recoveredArray = [];

    let loopLength = confirmedLocations.length;

    //loop through all locations and get latest cases and countries
    for (let i = 0; i < loopLength; i++ ) {
        let confirmedCountry = data.confirmed.locations[i].country,
        confirmedCasesPerCountry = data.confirmed.locations[i].latest;

        let deathCountry = data.deaths.locations[i].country,
            deathCasesPerCountry = data.deaths.locations[i].latest;

        let recoveredCountry = data.recovered.locations[i].country,
            recoveredCasesPerCountry = data.recovered.locations[i].latest;

        confirmedArray.push( {
            country: confirmedCountry, 
            value: confirmedCasesPerCountry
        });
        deathArray.push( {
            country: deathCountry, 
            value: deathCasesPerCountry
        });
        recoveredArray.push( {
            country: recoveredCountry, 
            value: recoveredCasesPerCountry
        });
    }

    //sorts array of objects by value from greatest to least
    sortGreatestToLeast(confirmedArray);
    sortGreatestToLeast(deathArray);
    sortGreatestToLeast(recoveredArray);

    //creates div elements and prints sorted array of objects to divs
    for (let i = 0; i < loopLength; i++ ) {
        //declare confirmed case variables
        let confirmedCasesValue = addCommasToNumbers( confirmedArray[i].value ),
            confirmedCountry = confirmedArray[i].country;

        //declare death cases variables
        let deathCasesValue = addCommasToNumbers( deathArray[i].value ),
        deathCountry = deathArray[i].country;

        //declare recovered cases variables
        let recoveredCasesValue = addCommasToNumbers( recoveredArray[i].value ),
        deathRecoveries = recoveredArray[i].country;

        //create an element [<span>] for each country and add the value and country to that span
        let confirmedCountryList = document.createElement("div");
        confirmedCountryList.innerHTML = 
            `<span class="redNumber">${confirmedCasesValue}</span> ` +
            confirmedCountry;

        //create an element [<span>] for each country and add the value and country to that span
        let deathCountryList = document.createElement("div");
        deathCountryList.innerHTML = 
            `<span class="redNumber">${deathCasesValue}</span> ` +
                deathCountry;

        //create an element [<span>] for each country and add the value and country to that span
        let recoveredCountryList = document.createElement("div");
        recoveredCountryList.innerHTML = 
            `<span class="redNumber">${recoveredCasesValue}</span> ` +
            deathRecoveries;

        //write all lists to html
        casesListEl.appendChild(confirmedCountryList); 
        deathListEl.appendChild(deathCountryList);
        recoveryListEl.appendChild(recoveredCountryList);
    }

    //sorts array from greatest to least
    function sortGreatestToLeast( x ) {
        return x.sort( (a,b) => b.value - a.value );
    }
    //adds commas every 3 digits
    function addCommasToNumbers( x ) {
        return x.toLocaleString();
    }
});