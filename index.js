let latestSummary = "https://corona.lmao.ninja/all";
let allCountries = "https://corona.lmao.ninja/countries";

let casesListEl = document.querySelector('.casesList'),
    deathListEl = document.querySelector('.deathList'),
    recoveryListEl = document.querySelector('.recoveryList');

let deathArray = [];
let recoveredArray = [];

fetchLatestInfo();
fetchCountries();

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

            console.log(longitude, latitude);

            if (longitude && latitude) {
                let circle = L.circle([longitude, latitude], {
                    color: 'red',
                    fillColor: '#f03',
                    fillOpacity: 0.3,
                    radius: 10000 + (cases * 30)
                }).addTo(mymap);

                circle.bindPopup(
                    `Country: ${country} <br>
                    <br>
                    Cases: ${addCommas(cases)} <br>
                    Deaths: ${addCommas(deaths)} <br>
                    <br>
                    Active Cases: ${addCommas(active)} <br>
                    Recovered: ${addCommas(recovered)} <br>
                    Today's Cases: ${addCommas(todayCases)} <br>
                    Today's Deaths: ${addCommas(todayDeaths)} <br>
                    Critical condition: ${addCommas(critical)}`
                );
            }
        }
      fetchLatLongitude();
    }
}

function printToHTML(casesValue, country, countryList) {
    countryList.innerHTML = 
        `<span class="redNumber">${addCommas(casesValue)}</span> ` + `<span class="countryColor">${country}</span>`;
        countryList.classList = "divider";
}

//adds commas every 3 digits
function addCommas( x ) {
    return x.toLocaleString();
}
