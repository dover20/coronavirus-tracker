//jshint -W104
//jshint -W119

let api = "https://coronavirus-tracker-api.herokuapp.com/all";

//declare arrays
let confirmedArray = [];
let deathArray = [];
let recoveredArray = [];



async function fetchAPI() {
    const response = await fetch(api);
    const data = await response.json();


    let totalConfirmed = data.confirmed.latest,
    confirmedLocations = data.confirmed.locations,
    lastUpdate = data.confirmed.last_updated,
    totalDeaths = data.deaths.latest,
    totalRecovered = data.recovered.latest;

    let casesListEl = document.querySelector('.casesList');
    let deathListEl = document.querySelector('.deathList');
    let recoveryListEl = document.querySelector('.recoveryList');

    //convert UTC date to better formatted date
    let dateObj = new Date(lastUpdate);
    let options = {
        weekday: "long",
        year: "numeric",
        month: "short",
        day: "numeric"
    };

    let time = dateObj.toLocaleTimeString('en', {
        hour: "numeric", 
        minute: "numeric"
    });
    let formattedDate = dateObj.toLocaleDateString('en', options);

    document.querySelector('#totalConfirmed').innerHTML = addCommasToNumbers( totalConfirmed );
    document.querySelector('#totalDeaths').innerHTML = addCommasToNumbers( totalDeaths );
    document.querySelector('#totalRecovered').innerHTML = addCommasToNumbers( totalRecovered );
    document.querySelector('#lastUpdated').innerHTML += `${time} ` + formattedDate;

    let loopLength = confirmedLocations.length;

    //loop through all locations and get latest cases and countries
    for (let i = 0; i < loopLength; i++ ) {
        let confirmedLatitude = data.confirmed.locations[i].coordinates.lat,
        confirmedLongitude = data.confirmed.locations[i].coordinates.long;

        let confirmedCountry = data.confirmed.locations[i].country,
            confirmedCasesPerCountry = data.confirmed.locations[i].latest,
            province = data.confirmed.locations[i].province;

        let deathCountry = data.deaths.locations[i].country,
            deathCasesPerCountry = data.deaths.locations[i].latest;

        let recoveredCountry = data.recovered.locations[i].country,
            recoveredCasesPerCountry = data.recovered.locations[i].latest;

        confirmedArray.push( {
            country: confirmedCountry, 
            province: province,
            value: confirmedCasesPerCountry,
            lat: confirmedLatitude,
            long: confirmedLongitude
        });

        deathArray.push( {
            country: deathCountry,
            province: province,
            value: deathCasesPerCountry
        });

        recoveredArray.push( {
            country: recoveredCountry,
            province: province,
            value: recoveredCasesPerCountry
        });
    }

    //sorts array of objects by value from greatest to least
    sortGreatestToLeast(confirmedArray);
    sortGreatestToLeast(deathArray);
    sortGreatestToLeast(recoveredArray);

    ////Create Map
    var mymap = L.map('mapid').setView([40.03, -99.20], 4);

    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 15,
        minZoom: 2,
        id: 'baconator45/ck7y95u8o0n5u1iqdpws3vyyo',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoiYmFjb25hdG9yNDUiLCJhIjoiY2s3eTV0aTRqMDNlZzNtbnMzajR0dDZiNyJ9.4rvhOofAx_ggGO7ZbxOuTQ'
    }).addTo(mymap);

    //creates div elements and prints sorted array of objects to divs
    for (let i = 0; i < loopLength; i++ ) {
        //declare confirmed case variables
        let confirmedCasesValue = addCommasToNumbers( confirmedArray[i].value ),
            confirmedCasesForMap = confirmedArray[i].value,
            confirmedProvince = confirmedArray[i].province,
            confirmedCountry = confirmedArray[i].country,
            latitude = confirmedArray[i].lat,
            longitude = confirmedArray[i].long;        

        //declare death cases variables
        let deathCasesValue = addCommasToNumbers( deathArray[i].value ),
            deathProvince = deathArray[i].province;
            deathCountry = deathArray[i].country;

        //declare recovered cases variables
        let recoveredCasesValue = addCommasToNumbers( recoveredArray[i].value ),
            recoveredProvince = recoveredArray[i].province;
            recoveredCountry = recoveredArray[i].country;

        let confirmedCountryList = document.createElement("div"),
            deathCountryList = document.createElement("div"),
            recoveredCountryList = document.createElement("div");

        if ( confirmedCasesForMap > 0 ) {
            //create red circles on map based on latitude and longitude
            let  circle = L.circle([latitude, longitude], {
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.3,
                radius: 10000 + (confirmedCasesForMap * 30)
        }).addTo(mymap);
        
        //binds popups to circles saying the country and how many cases
        if( confirmedProvince ) {
            circle.bindPopup(
                `Province: ${confirmedProvince}, ${confirmedCountry} <br> Cases: ${confirmedCasesValue}`
            );
        } else if (confirmedProvince && confirmedCountry === deathCountry ) {
            circle.bindPopup(
                `Province: ${confirmedProvince}, ${confirmedCountry} <br> Cases: ${confirmedCasesValue} <br> Deaths: ${deathCasesValue}`
            );
        } else {
            circle.bindPopup(
            `Country: ${confirmedCountry} <br> Cases: ${confirmedCasesValue}`
            );
        }
    }

        printToHTML(confirmedCasesValue, confirmedProvince, confirmedCountry, confirmedCountryList, confirmedArray[i].value);
        printToHTML(deathCasesValue, deathProvince, deathCountry, deathCountryList, deathArray[i].value);
        printToHTML(recoveredCasesValue, recoveredProvince, recoveredCountry, recoveredCountryList, recoveredArray[i].value);

        //write all lists to html
        casesListEl.appendChild(confirmedCountryList); 
        deathListEl.appendChild(deathCountryList);
        recoveryListEl.appendChild(recoveredCountryList);
    }
}

function printToHTML(casesValue, province, country, countryList, arrayValues) {
    if (casesValue > 0 && province != "") {
        //create an element [<span>] for each country and add the value and country to that span
        countryList.innerHTML = 
            `<span class="redNumber">${casesValue}</span> ` + province + ", " + `<span class="countryColor">${country}</span>`;
            countryList.classList = "divider";
    } else if( arrayValues > 0 ) {
        countryList.innerHTML = 
            `<span class="redNumber">${casesValue}</span> ` + `<span class="countryColor">${country}</span>`;
            countryList.classList = "divider";
    }
}

//sorts array from greatest to least
function sortGreatestToLeast( x ) {
    return x.sort( (a,b) => b.value - a.value );
}
//adds commas every 3 digits
function addCommasToNumbers( x ) {
    return x.toLocaleString();
}

fetchAPI();