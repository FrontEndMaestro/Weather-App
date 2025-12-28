const giphyKey = "LTTyZ3GxkMw35SE1aUTNHGFTXaTaPmNG";

let rainUrl = `https://api.giphy.com/v1/gifs/t7Qb8655Z1VfBGr5XB?api_key=${giphyKey}&rating=g`;

let cloudyUrl = `https://api.giphy.com/v1/gifs/gs2ubveMcc2zPVNceK?api_key=${giphyKey}&rating=g`;

let clearSky = `https://api.giphy.com/v1/gifs/VxbvpfaTTo3le?api_key=${giphyKey}&rating=g`;

let snowUrl = `https://api.giphy.com/v1/gifs/rmuwjm1FLjxoQ?api_key=${giphyKey}&rating=g`;
function throwCustomLocationError() {
  throw {
    name: "Invalid Location",
    message: "Please enter correct location",
  };
}

async function apiRequest(location) {
  let response;
  response = await fetch(
    `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?unitGroup=uk&key=9BR5THTRMDJSGB8PPUHUCR2PH&contentType=json`,
    { cache: "reload" },
  );
  if (!response.ok) {
    if (response.status == 400) {
      throwCustomLocationError();
    } else throw new Error(response.status);
  }

  const jsonData = await response.json();
  let processedData = processData(jsonData);
  let fetchgeo = await fetchGeocodingLocation(
    jsonData.latitude,
    jsonData.longitude,
  );

  processedData["location"] = fetchgeo;
  if (
    processedData.icon.includes("cloudy") ||
    processedData.icon.includes("fog") ||
    processedData.icon == "Overcast"
  ) {
    let gif = await fetch(cloudyUrl);
    let gifjson = await gif.json();

    var url = gifjson.data.images.original.url;
  } else if (processedData.icon.includes("clear")) {
    let gif = await fetch(clearSky);
    let gifjson = await gif.json();

    var url = gifjson.data.images.original.url;
  } else if (processedData.icon.includes("rain")) {
    let gif = await fetch(rainUrl);
    let gifjson = await gif.json();

    var url = gifjson.data.images.original.url;
  } else if (processedData.icon.includes("Snow")) {
    console.log("hello");
    let gif = await fetch(snowUrl);

    let gifjson = await gif.json();

    var url = gifjson.data.images.original.url;
  }

  return { processedData, url };
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
    processedElement["date"] = new Date(element.datetimeEpoch * 1000);
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
  if (city == undefined) {
    throwCustomLocationError();
  }
  return { country, city };
}

export { apiRequest };
