let data_type = {
  Deaths: "Mortes",
  Recovered: "Recuperados",
  Confirmed: "Confirmados",
};

let linesChart;

!(async () => {
  document.getElementById("filtro").addEventListener("click", handlerFilter);

  let response = await Promise.allSettled([
    axios.get("https://api.covid19api.com/countries"),
    axios.get(
      `https://api.covid19api.com/country/Brazil?from=${new Date(
        2021,
        04,
        05,
        -3,
        0,
        0
      ).toISOString()}&to=${new Date(2021, 04, 25, -3, 0, 0).toISOString()}`
    ),
    axios.get(
      `https://api.covid19api.com/country/Brazil?from=${new Date(
        2021,
        04,
        04,
        -3,
        0,
        0
      ).toISOString()}&to=${new Date(2021, 04, 24, -3, 0, 0).toISOString()}`
    ),
  ]);

  if (response[0].status === "fulfilled") {
    loadComboCountries(_.orderBy(response[0].value.data, "Country", "asc"));
  }
  if (
    response[1].status === "fulfilled" &&
    response[2].status === "fulfilled"
  ) {
    loadKPI(_.last(response[1].value.data));
    loadLineChart(
      response[1].value.data,
      response[2].value.data,
      document.getElementById("cmbData").value
    );
  }

  console.log(response);
})();

function loadComboCountries(json) {
  let combo = document.getElementById("cmbCountry");

  for (index in json) {
    combo.options[combo.options.length] = new Option(
      json[index].Country,
      json[index].Slug,
      json[index].Country === "Brazil",
      json[index].Country === "Brazil"
    );
  }
}

function loadKPI(json) {
  document.getElementById("kpiconfirmed").innerHTML =
    json.Confirmed.toLocaleString("PT");
  document.getElementById("kpideaths").innerHTML =
    json.Deaths.toLocaleString("PT");
  document.getElementById("kpirecovered").innerHTML =
    json.Recovered.toLocaleString("PT");
}

async function handlerFilter() {
  let startDate = new Date(document.getElementById("date_start").value);
  let endDate = new Date(document.getElementById("date_end").value);
  let country = document.getElementById("cmbCountry").value;

  console.log(startDate);

  startDate = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate() + 1,
    -3,
    0,
    0
  );

  endDate = new Date(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate() + 1,
    -3,
    0,
    1
  );

  let startDateDelta = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate(),
    -3,
    0,
    0
  );

  let endDateDelta = new Date(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate(),
    -3,
    0,
    1
  );

  let response = await Promise.allSettled([
    axios.get(
      `https://api.covid19api.com/country/${country}?from=${startDate.toISOString()}&to=${endDate.toISOString()}`
    ),
    axios.get(
      `https://api.covid19api.com/country/${country}?from=${startDateDelta.toISOString()}&to=${endDateDelta.toISOString()}`
    ),
  ]);

  if (
    response[0].status === "fulfilled" &&
    response[1].status === "fulfilled"
  ) {
    linesChart.destroy();
    loadKPI(_.last(response[1].value.data));
    loadLineChart(
      response[0].value.data,
      response[1].value.data,
      document.getElementById("cmbData").value
    );
  }
}

function loadLineChart(json, jsonDelta, dataType) {
  let dates = _.map(json, "Date");

  let values = _.map(json, dataType);

  let valuesDelta = _.map(jsonDelta, dataType);

  values = _.forEach(values, (x, index) => {
    values[index] = values[index] - valuesDelta[index];
  });

  let avg = _.times(values.length, _.constant(_.mean(values)));

  linesChart = new Chart(document.getElementById("linhas"), {
    type: "line",
    data: {
      labels: dates,
      datasets: [
        {
          data: values,
          label: `Número de ${data_type[dataType]}`,
          borderColor: "rgb(255,140,13)",
        },
        {
          data: avg,
          label: `Média de ${data_type[dataType]}`,
          borderColor: "rgb(255,0,0)",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: "top", //top, bottom, left, rigth
        },
        title: {
          display: true,
          text: "Curva diária de Covid-19",
          font: {
            size: 20,
          },
        },
        layout: {
          padding: {
            left: 100,
            right: 100,
            top: 50,
            bottom: 10,
          },
        },
      },
    },
  });
}
