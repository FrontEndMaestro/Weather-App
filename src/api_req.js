const apikey = "";

let giphyKey = "LTTyZ3GxkMw35SE1aUTNHGFTXaTaPmNG";
let rainUrl = "https://giphy.com/gifs/rain-vegeta-in-the-pNn4hlkovWAHfpLRRD";
let lighteningUrl = "https://giphy.com/gifs/black-storm-cloud-13ZEwDgIZtK1y";
let cloudyUrl = "https://giphy.com/gifs/nube-suave-algodon-gs2ubveMcc2zPVNceK";
let clearSky = "https://giphy.com/gifs/cat-kitten-kitty-VxbvpfaTTo3le";
let clearNight = "https://giphy.com/gifs/night-aaTz9fnXkzoQ";
async function apiRequest(location) {
  console.log(location);
  //implement try fetch logic here
  const response = await fetch(
    `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?unitGroup=uk&key=9BR5THTRMDJSGB8PPUHUCR2PH&contentType=json`,
    { cache: "reload" },
  );
  const jsonData = await response.json();
  console.log(jsonData);
  let processedData = processData(jsonData);
  let fetchgeo = fetchGeocodingLocation(jsonData.latitude, jsonData.longitude);
  fetchgeo.then((data) => {
    processedData["location"] = data;
  });
  console.log(processedData);
  return processedData;
}

function processData(data) {
  let time12Hr = timeConversion(data.currentConditions.datetimeEpoch);
  let date = new Date(
    data.currentConditions.datetimeEpoch * 1000,
  ).toLocaleDateString("en-GB");

  let temp = data.currentConditions.temp;
  let feelslike = data.currentConditions.feelslike;
  let condition = data.currentConditions.conditions;
  let todayMax = data.days.slice(0, 1)[0].tempmax;
  let todayMin = data.days.slice(0, 1)[0].tempmin;
  let hourly = hourlyforecast(
    data.days.slice(0, 1)[0].hours,
    new Date(data.currentConditions.datetimeEpoch * 1000),
  );
  let fiveDayForecast = processForecast(data.days.slice(1, 6));
  let icon = data.currentConditions.icon;
  let description = data.description;
  return {
    time: time12Hr,
    date: date,
    temperature: temp,
    feelsLike: feelslike,
    currentcondition: condition,
    todayMax: todayMax,
    todayMin: todayMin,
    hourlyForecast: hourly,
    fiveDayForecast: fiveDayForecast,
    icon: icon,
    description: description,
  };
}

function processForecast(forecast) {
  let processed = forecast.map((element) => {
    let processedElement = {};
    processedElement["date"] = new Date(
      element.datetimeEpoch * 1000,
    ).toLocaleDateString("en-GB");
    processedElement["condition"] = element.conditions;
    processedElement["temp"] = element.temp;
    processedElement["icon"] = element.icon;
    return processedElement;
  });
  return processed;
}

function hourlyforecast(hourlyData, time) {
  let hourlyFromNow = hourlyData.splice(time.getHours() + 1);
  let hourlyforecast = [];
  hourlyFromNow.forEach((element) => {
    let object = {
      time: timeConversion(element.datetimeEpoch),
      temp: element.temp,
      precipprob: element.precipprob,
      condition: element.conditions,
      icon: element.icon,
    };
    hourlyforecast.push(object);
  });
  //sconsole.log(hourlyforecast);
  return hourlyforecast;
}

function timeConversion(datetimeEpoch) {
  let time = new Date(datetimeEpoch * 1000);
  const time12hr = time.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return time12hr;
}

async function fetchGeocodingLocation(latitude, longitude) {
  const geocodingResponse = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
  );
  const jsondata = await geocodingResponse.json();
  let country = jsondata.address.country;
  let city = jsondata.address.city;
  return { country, city };
}

export { apiRequest };
