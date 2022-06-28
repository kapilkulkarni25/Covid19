var options = {
  series: [],
  chart: {
    type: "bar",
    height: "100%",
    width: "100%",
  },
  colors: ["#FFC55C", "#BA0F30", "#8AFF8A"],
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: "30%",
      endingShape: "rounded",
    },
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    show: true,
    width: 2,
    colors: ["transparent"],
  },
  xaxis: {
    categories: [],
  },
  yaxis: {
    title: {
      text: "No. of People",
    },
  },
  fill: {
    opacity: 1,
    colors: ["#FFC55C", "#BA0F30", "#8AFF8A"],
  },
  legend: {
    position: "top",
    horizontalAlign: "center",
    offsetX: 40,
  },
  tooltip: {
    y: {
      formatter: function (val) {
        return val;
      },
    },
  },
};

var chart = new ApexCharts(document.querySelector("#chart"), options);

chart.render();

const getCountryList = async () => {
  try {
    fetch("https://api.covid19api.com/countries")
      .then((response) => response.json())
      .then((json) => generateCountry(json));
  } catch (err) {
    console.log(err);
  }
};

const getCountryData = async (selectedCountries, test, countrData) => {
  // selectedCountries.forEach((country) => {
  try {
    fetch(`https://api.covid19api.com/total/dayone/country/${test}`)
      .then((response) => response.json())
      .then((json) => {
        if (json.length > 1) {
          selectedCountries.push(test);
          countrData.push({ name: test, data: json });
          generateGraph(json, selectedCountries, countrData);
        }
      });
  } catch (err) {
    console.log(err);
  }
  // })
};

function debounce(fn) {
  let timer;
  return function (...args) {
    if (timer) clearTimeout(timer);

    timer = setTimeout(() => {
      fn.apply(this, args);
    }, 300);
  };
}

function generateCountry(countries) {
  let countries_tab = document.querySelector(".countries-tab");
  let fragment = document.createDocumentFragment();

  function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  for (let i = 0; i < 5; i++) {
    let div = document.createElement("label");
    var checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("countries");
    const rndInt = randomIntFromInterval(1, countries.length);
    checkbox.name = `${countries[rndInt].Country}`;
    checkbox.value = `${countries[rndInt].Slug}`;
    div.innerHTML = `${countries[rndInt].Country}`;
    div.append(checkbox);
    fragment.append(div);
  }
  countries_tab.append(fragment);

  let tabCountries = document.querySelectorAll(".countries");
  let selectedCountries = [];
  var countrData = [];

  for (let i = 0; i < tabCountries.length; i++) {
    tabCountries[i].addEventListener(
      "click",
      debounce((e) => {
        if (e.target.checked) {
          // selectedCountries.push(e.target.value)
          document.querySelector(".chart-conatiner").style.display = "block";
          e.target.parentElement.classList.add("selected");
          getCountryData(selectedCountries, e.target.value, countrData);
        } else {
          selectedCountries = selectedCountries.filter(
            (ele) => e.target.value !== ele
          );
          countrData = countrData.filter((ele) => e.target.value !== ele.name);
          e.target.parentElement.classList.remove("selected");
          if (selectedCountries.length === 0) {
            document.querySelector(".chart-conatiner").style.display = "none";
            generateGraph([], selectedCountries, []);
          } else {
            // getCountryData(selectedCountries, e.target.value, countrData)
            generateGraph(countrData, selectedCountries, countrData);
          }
        }
      })
    );
  }
}

function generateGraph(countryData, selectedCountries, countrData) {
  if (countryData.length === 0) {
    return;
  }

  let chartDataConfirmed = [];
  let chartDataDeaths = [];
  let chartDataActive = [];
  let countryLabels = [];

  countrData.forEach((ele) => {
    if (ele.data.length > 1) {
      countryLabels.unshift(ele.data[ele.data.length - 1].Country);
      chartDataConfirmed.unshift(ele.data[ele.data.length - 1].Confirmed);
      chartDataDeaths.unshift(ele.data[ele.data.length - 1].Deaths);
      chartDataActive.unshift(ele.data[ele.data.length - 1].Active);
    }
  });

  chart.updateOptions({
    series: [
      {
        name: "Confirmed Cases",
        data: chartDataConfirmed,
      },
      {
        name: "Deaths",
        data: chartDataDeaths,
      },
      {
        name: "Recovered",
        data: chartDataActive,
      },
    ],
    xaxis: {
      categories: countryLabels,
    },
  });
}

getCountryList();
