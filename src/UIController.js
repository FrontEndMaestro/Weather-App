import { apiRequest } from "./api_req";

function setEventListeners() {
  const input = document.querySelector(".search-box");
  input.addEventListener("input", () => {
    //clear error message if the input is empty
    if (input.value.trim() === "") {
      input.setCustomValidity("");
      document.querySelector(".error").textContent = "";
    }
  });

  document.querySelector("#wrapper").classList.remove("wrapper");
  input.addEventListener("submit", (event) => {
    //display loading screen
    document.querySelector(".loader-overlay").classList.remove("hide");
    event.preventDefault();
    callApiRequest(input.value);
  });
}

function callApiRequest(value) {
  const fetchedData = apiRequest(value);
  fetchedData.then((data) => {
    //hide loading screen & display content
    document.querySelector(".loader-overlay").classList.add("hide");
    populateUi(fetchedData);
  }).catch(function (error) {
    document.querySelector(".loader-overlay").classList.add("hide");
    if (error.name == "Invalid Location") {
      showInvalidLocation();
    }
    console.log("error fetching weather data", error);
  });
}

function showInvalidLocation() {
  const input = document.querySelector(".search-box");
  input.setCustomValidity("Invalid Location");
  document.querySelector(".error").textContent = "Invalid Location !";
}

function populateUi(data) {
  let body = document.querySelector("body");
  let weatherData = data.processedData;
  document.querySelector(".condition").textContent =
    weatherData.currentcondition;
  document.querySelector(".temp").textContent = weatherData.temperature;
  document.querySelector(".unit").textContent = "°C";
  document.querySelector(".feels-like").textContent =
    "Feels Like: " + weatherData.feelsLike;
  document.querySelector(".description").textContent = weatherData.description;

  document.querySelector(".location").textContent =
    weatherData.location.city.toUpperCase() +
    "," +
    weatherData.location.country.toUpperCase();

  let url = data.url;
  body.style.backgroundImage = `url('${url}')`;

  document.querySelector("#wrapper").classList.add("wrapper");
  forecastDisplay(weatherData.fiveDayForecast);
}

function forecastDisplay(data) {
  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const forecastContainer = document.querySelector(".forecast");
  forecastContainer.innerHTML = "";

//displays weather prediction of 5 days
  data.forEach((element) => {
    let date = element.date.getDay();
    let day = days[date];
    let child = document.createElement("div");
    child.classList.add("child");
    let icon = document.createElement("img");
    icon.classList.add("icon");
    let image = importIcons(element.condition);
    image.then((url) => {
      icon.src = url;
    });
    let dateDiv = document.createElement("div");
    dateDiv.classList.add("dateDiv");
    dateDiv.textContent = day;
    let temperature = document.createElement("div");
    temperature.classList.add("forecast-temp");
    temperature.textContent = element.temp + " C°";
    child.appendChild(dateDiv);
    child.appendChild(icon);
    child.appendChild(temperature);
    forecastContainer.append(child);
  });
}

async function importIcons(condition) {
  if (condition.includes("Clear")) {
    let { default: icon } = await import("../resources/clear.png");
    return icon;
  }

  if (condition.includes("snow")) {
    let { default: icon } = await import("../resources/snow.png");
    return icon;
  }

  if (condition.includes("rain")) {
    let { default: icon } = await import("../resources/rain.png");
    return icon;
  }

  if (condition.includes("cloud") || condition.includes("vercast")) {
    let { default: icon } = await import("../resources/cloudy.png");
    return icon;
  }
}

export { setEventListeners, callApiRequest };
