let latestSummary = "https://corona.lmao.ninja/v2/all",
    allCountries = "https://corona.lmao.ninja/v2/countries",
    allStates = "https://corona.lmao.ninja/v2/states";

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
    sortedStateCases = [];
    
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
var mymap = L.map('mapid').setView([31.749, 0.335], 2);

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
    
    //concatenates arrays then sorts it, greatest to least
    deathArray = data.concat().sort( (a,b) => b.deaths - a.deaths );
    recoveredArray = data.concat().sort( (a,b) => b.recovered - a.recovered );
    casesByCountryArray = data.concat().sort( (a,b) => b.cases - a.cases );

    for (let i = 0; i < loopLength; i++) {

        let countrySortedList = casesByCountryArray[i].country,
            casesSortedList = casesByCountryArray[i].cases,
            country = data[i].country,
            cases = data[i].cases,
            todayCases = data[i].todayCases,
            deaths = data[i].deaths,
            todayDeaths = data[i].todayDeaths,
            recovered = data[i].recovered,
            active = data[i].active,
            critical = data[i].critical,
            casesPerMillion = data[i].casesPerOneMillion,
            deathsPerMillion = data[i].deathsPerOneMillion,
            tests = data[i].tests,
            testsPerMillion = data[i].testsPerOneMillion,
            latitude = data[i].countryInfo.lat,
            longitude = data[i].countryInfo.long;

        function returnPercentage() {
            if (cases > 0 && tests > 0) {
                let testedPostive = (cases / tests) * 100;
                return testedPostive.toFixed(2) + "%";
            } else {
                return 0;
            }
        }

        criticalArray.push(critical);
        newCasesArray.push(todayCases);
        newDeathsArray.push(todayDeaths);

        //Get the total number of critical cases
        let totalCritical = sumOfArray(criticalArray);
        document.querySelector('.critical').innerHTML = addCommas(totalCritical);

        let totalNewCases = sumOfArray(newCasesArray);
        document.querySelector('.totalNewCases').innerHTML = addCommas(totalNewCases);

        let totalNewDeaths = sumOfArray(newDeathsArray);
        document.querySelector('.totalNewDeaths').innerHTML = addCommas(totalNewDeaths);

        //Sorted deaths  
        let sortedDeaths = deathArray[i].deaths,
            sortedDeathsCountry = deathArray[i].country;

        //Sorted recoveries
        let sortedRecoveries = recoveredArray[i].recovered;
            sortedRecoveriesCountry = recoveredArray[i].country;

        let casesCountryList = document.createElement("div"),
            deathsCountryList = document.createElement("div"),
            recoveredCountryList = document.createElement("div");

        printToHTML(casesSortedList, countrySortedList, casesCountryList, casesListEl);
        printToHTML(sortedDeaths, sortedDeathsCountry, deathsCountryList, deathListEl);
        printToHTML(sortedRecoveries, sortedRecoveriesCountry, recoveredCountryList, recoveryListEl);
        
        if (longitude && latitude) {
            let circle = L.circle([latitude, longitude], {
                color: 'rgb(195, 1, 1)',
                fillColor: 'rgb(216, 0, 0)',
                fillOpacity: 0.15,
                radius: (cases * 6)
            }).addTo(mymap);

            circle.bindPopup(
                `
                Country: <span class="popupNumber">${country}</span> <br>
                <br>
                <span class="highlight">Cases:</span> <span class="popupNumber">${addCommas(cases)}</span> <br>
                <span class="highlight">Deaths:</span> <span class="popupNumber">${addCommas(deaths)}</span> <br>
                Recovered: <span class="popupNumber">${addCommas(recovered)}</span> <br>
                Active Cases: <span class="popupNumber">${addCommas(active)}</span> <br>
                <span class="highlight">Today's Cases:</span> <span class="popupNumber">${addCommas(todayCases)}</span> <br>
                <span class="highlight">Today's Deaths:</span> <span class="popupNumber">${addCommas(todayDeaths)}</span> <br>
                Critical condition: <span class="popupNumber">${addCommas(critical)}</span> <br>
                Cases per million: <span class="popupNumber">${addCommas(casesPerMillion)}</span> <br>
                <span class="highlight">Deaths per million:</span> <span class="popupNumber">${addCommas(deathsPerMillion)}</span> <br>
                Total tests: <span class="popupNumber">${addCommas(tests)}</span> <br>
                Tests per million: <span class="popupNumber">${addCommas(testsPerMillion)}</span> <br>
                <span class="popupNumber">${returnPercentage()}</span> tested positive.`
                );
            }
        }
    });
}

function fetchStates() {
    fetch(allStates)
    .then(function(response) {
        return response.json();
    }).then(function(data) {

        sortedDeathArray = data.concat().sort( (a,b) => b.deaths - a.deaths );
        sortedStateCases = data.concat().sort( (a,b) => b.cases - a.cases );

        let loopLength = data.length;

        for (let i = 0; i < loopLength; i++) {

            let state = sortedStateCases[i].state,
                cases = sortedStateCases[i].cases;
            
            let deathState = sortedDeathArray[i].state,
                sortedDeaths = sortedDeathArray[i].deaths;
        
            let createStateCase = document.createElement('div'),
                createStateDeath = document.createElement('div');
        
            printToHTML(cases, state, createStateCase, stateCasesListEl);
            printToHTML(sortedDeaths, deathState, createStateDeath, stateDeathsListEl);
        }

        function fetchStateDeaths() {
            fetch(allCountries)
            .then(function(response) {
                return response.json();
            }).then(function(data) {
                let covidCases;
                let usaDeathsToday = data[201].todayDeaths;

                if (usaDeathsToday < 1214) {
                    covidCases = 1214;
                } else {
                    covidCases = usaDeathsToday;
                }

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
                        cases: covidCases
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
                        cases: 107
                    },
                    {
                        disease: "Chronic liver disease and cirrhosis",
                        cases: 104
                    }
                ];

                let sortedCauseOfDeathArray = leadingCausesOfDeath.concat().sort( (a,b) => b.cases - a.cases );
            
                let loopLength = sortedCauseOfDeathArray.length;
            
                for (let i = 0; i < loopLength; i++) {
                    let diseases = sortedCauseOfDeathArray[i].disease,
                        cases = sortedCauseOfDeathArray[i].cases;
            
                    let diseaseElement = document.createElement('div');

                    printToHTML( cases, diseases, diseaseElement, casesTodayListEl );
                }
            });
        }
      fetchStateDeaths();
    });
}

//adds value and country to the lists
function printToHTML(redValue, country, elementToModify, elementToAppend) {
    elementToModify.innerHTML = 
        `<span class="redNumber">${addCommas(redValue)}</span> ` + country;
    elementToModify.classList = "divider";
    elementToAppend.appendChild(elementToModify);
}

//adds commas every 3 digits
function addCommas( num ) {
    if (num > 0) {
        return num.toLocaleString();
    } else {
        return 0;
    }
}

//gets the sum of all the items in an array
function sumOfArray( x ) {
    return x.reduce(function(acc, val) { return acc + val; }, 0);
}
