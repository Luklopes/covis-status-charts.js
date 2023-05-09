(async () => {
  let response = await axios.get("https://api.covid19api.com/summary");

  if (response.status === 200) {
    loadKPI(response.data.Global);
    loadBarChart(response.data.Countries);
    loadPieChart(response.data.Global);
  }
})();

function loadKPI(json) {
  document.getElementById("confirmed").innerHTML =
    json.TotalConfirmed.toLocaleString("PT");
  document.getElementById("death").innerHTML =
    json.TotalDeaths.toLocaleString("PT");
  document.getElementById("recovered").innerHTML =
    json.TotalRecovered.toLocaleString("PT");
}

function loadBarChart(json) {
  let countriesSorted = _.orderBy(
    json,
    ["TotalDeaths", "Country"],
    ["desc", "asc"]
  );

  let countriesSliced = _.slice(countriesSorted, 0, 10);

  let countriesMapped = _.map(countriesSliced, "Country");

  let totalDeathsMapped = _.map(countriesSliced, "TotalDeaths");

  let bar = new Chart(document.getElementById("barras"), {
    type: "bar",
    data: {
      labels: countriesMapped,
      datasets: [
        {
          label: "Total de Mortes",
          data: totalDeathsMapped,
          backgroundColor: "rgba(153, 102, 255)",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: "Top 10 número de mortes por país",
          font: {
            size: 20,
          },
        },
      },
    },
  });
}
function loadPieChart(json) {
  let totalData = [json.NewConfirmed, json.NewDeaths, json.NewRecovered];

  let pizza = new Chart(document.getElementById("pizza"), {
    type: "pie",
    data: {
      labels: ["Confirmados", "Mortes", "Recuperados"],
      datasets: [
        {
          data: totalData,
          backgroundColor: [
            "rgb(255, 99, 132)",
            "rgb(54, 162, 235)",
            "rgb(255, 205, 86)",
          ],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: "top",
        },
        title: {
          display: true,
          text: "Distribuicao de novos casos",
          font: {
            size: 20,
          },
        },
      },
    },
  });
}
