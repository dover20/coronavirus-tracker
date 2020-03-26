let latestSummary = "https://corona.lmao.ninja/all",
    allCountries = "https://corona.lmao.ninja/countries",
    allStates = "https://corona.lmao.ninja/states";

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
    casesByCountryArray = [],
    totalNewDeathsTodayArray = [];

fetchLatestInfo();
fetchCountries();
fetchStates();

function fetchLatestInfo() {
    fetch(latestSummary).then(function(response) {
        return response.json();
    }).then(function(data) {

        let totalCases = data.cases,
            totalDeaths = data.deaths,
            totalRecoveries = data.recovered,
            latestUpdate = data.updated;

        let fatalityPercentage = (totalDeaths / totalCases) * 100;

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
        document.querySelector('.fatalityPercentage').innerHTML = fatalityPercentage.toFixed(2) + "%";
    });
}

////Create Map
var mymap = L.map('mapid').setView([39.12, -98.5], 2);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    
    minZoom: 2,
    id: 'baconator45/ck7y95u8o0n5u1iqdpws3vyyo',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiYmFjb25hdG9yNDUiLCJhIjoiY2s3eTV0aTRqMDNlZzNtbnMzajR0dDZiNyJ9.4rvhOofAx_ggGO7ZbxOuTQ'
}).addTo(mymap);

function fetchCountries() {
    fetch(allCountries)
    .then(function(response){
        return response.json();
    }).then(function(data) {
    
    let loopLength = data.length;
    
    //copys array then sorts it, greatest to least
    deathArray = data.concat().sort( (a,b) => b.deaths - a.deaths );
    recoveredArray = data.concat().sort( (a,b) => b.recovered - a.recovered );
    casesByCountryArray = data.concat().sort( (a,b) => b.cases - a.cases );

    for (let i = 0; i < loopLength; i++) {

        let country = casesByCountryArray[i].country,
            cases = casesByCountryArray[i].cases,
            todayCases = data[i].todayCases,
            deaths = data[i].deaths,
            todayDeaths = data[i].todayDeaths,
            recovered = data[i].recovered,
            active = data[i].active,
            critical = data[i].critical;

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
        
        function fetchLatLongitude() {
            fetch(apiGetCoordinates).then(function(response) {
                return response.json();
            }).then(function(data) {

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
        });
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
});
}

function fetchStates() {
    fetch(allStates)
    .then(function(response) {
        return response.json();
    }).then(function(data) {

        let sortedDeathArray = data.concat().sort( (a,b) => b.deaths - a.deaths );

        let loopLength = data.length;

        for (let i = 0; i < loopLength; i++) {

            let state = data[i].state,
                cases = data[i].cases;
            
            let deathState = sortedDeathArray[i].state,
                sortedDeaths = sortedDeathArray[i].deaths;
        
            let createStateCase = document.createElement('div'),
                createStateDeath = document.createElement('div');
        
            printToHTML(cases, state, createStateCase);
            printToHTML(sortedDeaths, deathState, createStateDeath);
        
            stateCasesListEl.appendChild(createStateCase);
            stateDeathsListEl.appendChild(createStateDeath);
        }

        function fetchStateDeaths() {
            fetch(allCountries)
            .then(function(response) {
                return response.json();
            }).then(function(data) {

                let leadingCausesOfDeath = [
                    {
                        disease: "Heart Disease",
                        cases: 1773
                    },
                    {
                        disease: "Cancer",
                        cases: 1641
                    },
                    {
                        disease: "Accidents (unintentional injuries)",
                        cases: 442
                    },
                    {
                        disease: "Chronic Lower Respiratory Disease",
                        cases: 439
                    },
                    {
                        disease: "Stroke",
                        cases: 401
                    },
                    {
                        disease: "Alzheimers",
                        cases: 333
                    },
                    {
                        disease: "COVID-19 Coronavirus",
                        cases: data[1].todayDeaths
                    },
                    {
                        disease: "Diabetes",
                        cases: 229
                    },
                    {
                        disease: "Flu and Pneumonia",
                        cases: 153
                    },
                    {
                        disease: "Kidney Disease",
                        cases: 139
                    },
                    {
                        disease: "Suicide",
                        cases: 129
                    },
                    {
                        disease: "Septicemia",
                        cases: "107"
                    },
                    {
                        disease: "Chronic liver disease and cirrhosis",
                        cases: "104"
                    }
                ];

                let sortedCauseOfDeathArray = leadingCausesOfDeath.concat().sort( (a,b) => b.cases - a.cases );
            
                let deathLoopLength = sortedCauseOfDeathArray.length;
            
                for (let i = 0; i < deathLoopLength; i++) {
                    let diseases = sortedCauseOfDeathArray[i].disease,
                        cases = sortedCauseOfDeathArray[i].cases;
            
                    let diseaseElement = document.createElement('div');

                    printToHTML( cases, diseases, diseaseElement );
                    casesTodayListEl.appendChild(diseaseElement);
                }
            });
        }
      fetchStateDeaths();
    });
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
