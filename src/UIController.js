import { apiRequest } from "./api_req";

function setEventListeners() {
  document.querySelector(".search").addEventListener("submit", (event) => {
    event.preventDefault();
    let input = document.querySelector(".search-box");
    console.log(input.value);
    const Data = apiRequest(input.value);
    Data.then((data) => {
      populateUi(data);
    });
  });
}

function populateUi(weatherData) {
  console.log(weatherData);
  document.querySelector(".temp").textContent = weatherData.temperature + " °C";
  document.querySelector(".feels-like").textContent =
    "Feels Like: " + weatherData.feelsLike;
  document.querySelector(".description").textContent = weatherData.description;
  document.querySelector(".condition").textContent =
    weatherData.currentcondition;
}

export { setEventListeners };
