let latestSummary = "https://corona.lmao.ninja/all";
let allCountries = "https://corona.lmao.ninja/countries";
let allStates = "https://corona.lmao.ninja/states";

let casesListEl = document.querySelector('.casesList'),
    deathListEl = document.querySelector('.deathList'),
    recoveryListEl = document.querySelector('.recoveryList'),

    stateCasesListEl = document.querySelector('.stateCases'),
    stateDeathsListEl = document.querySelector('.stateDeaths'),
    casesTodayListEl = document.querySelector('.casesToday');

let deathArray = [],
    recoveredArray = [],
    criticalArray = [],
    newCasesArray = [],
    newDeathsArray = [],
    stateDeathsArray = [],
    stateNewCasesArray = [];

fetchLatestInfo();
fetchCountries();
fetchStates();

async function fetchLatestInfo() {
    const response = await fetch(latestSummary);
    const data = await response.json();

    let totalCases = data.cases,
        totalDeaths = data.deaths,
        totalRecoveries = data.recovered,
        latestUpdate = data.updated;

    //convert UTC date to a better formatted date
    let dateObj = new Date(latestUpdate);
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
    
    //print numbers to HTML
    document.querySelector('#totalConfirmed').innerHTML = addCommas( totalCases );
    document.querySelector('#totalDeaths').innerHTML = addCommas( totalDeaths );
    document.querySelector('#totalRecovered').innerHTML = addCommas( totalRecoveries );
    document.querySelector('#lastUpdated').innerHTML += `${time} ` + formattedDate;
}

////Create Map
var mymap = L.map('mapid').setView([30.54, 4.58], 2);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    
    minZoom: 2,
    id: 'baconator45/ck7y95u8o0n5u1iqdpws3vyyo',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiYmFjb25hdG9yNDUiLCJhIjoiY2s3eTV0aTRqMDNlZzNtbnMzajR0dDZiNyJ9.4rvhOofAx_ggGO7ZbxOuTQ'
}).addTo(mymap);

async function fetchCountries() {
    const response = await fetch(allCountries);
    const data = await response.json();
    
    let loopLength = data.length;
    
    //copys array then sorts it, greatest to least
    deathArray = data.concat().sort( (a,b) => b.deaths - a.deaths );
    recoveredArray = data.concat().sort( (a,b) => b.recovered - a.recovered );

    for (let i = 0; i < loopLength; i++) {

        let country = data[i].country,
            cases = data[i].cases,
            todayCases = data[i].todayCases,
            deaths = data[i].deaths,
            todayDeaths = data[i].todayDeaths,
            recovered = data[i].recovered,
            active = data[i].active,
            critical = data[i].critical,
            casesPerOneMillion = data[i].casesPerOneMillion;    

        criticalArray.push(critical);
        newCasesArray.push(todayCases);
        newDeathsArray.push(todayDeaths);

        //Sorted deaths  
        let sortedDeaths = deathArray[i].deaths,
            sortedDeathsCountry = deathArray[i].country;

        //Sorted recoveries
        let sortedRecoveries = recoveredArray[i].recovered;
            sortedRecoveriesCountry = recoveredArray[i].country;

        let casesCountryList = document.createElement("div"),
            deathsCountryList = document.createElement("div"),
            recoveredCountryList = document.createElement("div");

        printToHTML(cases, country, casesCountryList);
        printToHTML(sortedDeaths, sortedDeathsCountry, deathsCountryList);
        printToHTML(sortedRecoveries, sortedRecoveriesCountry, recoveredCountryList);
    
        //write all lists to html
        casesListEl.appendChild(casesCountryList); 
        deathListEl.appendChild(deathsCountryList);
        recoveryListEl.appendChild(recoveredCountryList); 

        let apiGetCoordinates = `https://restcountries.eu/rest/v2/name/${country}`;
        
        async function fetchLatLongitude() {
            const response = await fetch(apiGetCoordinates);
            const data = await response.json();

            let longitude = data[0].latlng[0],
                latitude = data[0].latlng[1];

            if (longitude && latitude) {
                let circle = L.circle([longitude, latitude], {
                    color: 'rgb(195, 1, 1)',
                    fillColor: 'rgb(216, 0, 0)',
                    fillOpacity: 0.15,
                    radius: 20000 + (cases * 35)
                }).addTo(mymap);

                circle.bindPopup(
                    `Country: <span class="popupNumber">${country}</span> <br>
                    <br>
                    Cases: <span class="popupNumber">${addCommas(cases)}</span> <br>
                    Deaths: <span class="popupNumber">${addCommas(deaths)}</span> <br>
                    Recovered: <span class="popupNumber">${addCommas(recovered)}</span> <br>
                    Active Cases: <span class="popupNumber">${addCommas(active)}</span> <br>
                    Today's Cases: <span class="popupNumber">${addCommas(todayCases)}</span> <br>
                    Today's Deaths: <span class="popupNumber">${addCommas(todayDeaths)}</span> <br>
                    Critical condition: <span class="popupNumber">${addCommas(critical)}</span>`
                );
            }
        }
      fetchLatLongitude();
    }
    
    //Get the total number of critical cases
    let totalCritical = sumOfArray(criticalArray);
    document.querySelector('.critical').innerHTML = addCommas(totalCritical);

    let totalNewCases = sumOfArray(newCasesArray);
    document.querySelector('.totalNewCases').innerHTML = addCommas(totalNewCases);

    let totalNewDeaths = sumOfArray(newDeathsArray);
    document.querySelector('.totalNewDeaths').innerHTML = addCommas(totalNewDeaths);
}

async function fetchStates() {
    const response = await fetch(allStates);
    const data = await response.json();

    let sortedDeathArray = data.concat().sort( (a,b) => b.deaths - a.deaths );
    let sortedNewCasesArray = data.concat().sort( (a,b) => b.todayCases - a.todayCases );

    let loopLength = data.length;

    for (let i = 0; i < loopLength; i++) {
        
        let state = data[i].state,
            cases = data[i].cases,
            deaths = data[i].deaths,
            todayCases = data[i].todayCases;
        
        let deathState = sortedDeathArray[i].state,
            sortedDeaths = sortedDeathArray[i].deaths;

        let newCaseState = sortedNewCasesArray[i].state,
            sortedNewCases = sortedNewCasesArray[i].todayCases;
    
        let createStateCase = document.createElement('div'),
            createStateDeath = document.createElement('div'),
            createStateNewCases = document.createElement('div');
    
        printToHTML(cases, state, createStateCase);
        printToHTML(sortedDeaths, deathState, createStateDeath);
        printToHTML(sortedNewCases, newCaseState, createStateNewCases);
    
        stateCasesListEl.appendChild(createStateCase);
        stateDeathsListEl.appendChild(createStateDeath);
        casesTodayListEl.appendChild(createStateNewCases);
    }
}

//adds value and country to the lists
function printToHTML(value, country, countryList) {
    countryList.innerHTML = 
        `<span class="redNumber">${addCommas(value)}</span> ` + `<span class="countryColor">${country}</span>`;
        countryList.classList = "divider";
}

//adds commas every 3 digits
function addCommas( x ) {
    return x.toLocaleString();
}

//gets the sum of all the items in an array
function sumOfArray( x ) {
    return x.reduce(function(acc, val) { return acc + val; }, 0);
}
