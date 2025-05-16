let chart;

async function getStock() {
  const symbol = document.getElementById("symbol").value.toUpperCase();
  const apiKey = "demo"; // Replace with your Alpha Vantage API key

  const quoteURL = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
  const historyURL = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`;

  try {
    const quoteRes = await fetch(quoteURL);
    const quoteData = await quoteRes.json();
    const quote = quoteData["Global Quote"];

    const infoDiv = document.getElementById("stock-info");

    if (!quote || !quote["05. price"]) {
      infoDiv.innerHTML = "<p>No data found for this symbol.</p>";
      return;
    }

    infoDiv.innerHTML = `
      <p><strong>Price:</strong> $${quote["05. price"]}</p>
      <p><strong>Change:</strong> ${quote["09. change"]} (${quote["10. change percent"]})</p>
      <p><strong>Open:</strong> $${quote["02. open"]}</p>
      <p><strong>High:</strong> $${quote["03. high"]}</p>
      <p><strong>Low:</strong> $${quote["04. low"]}</p>
    `;

    const historyRes = await fetch(historyURL);
    const historyData = await historyRes.json();
    const timeSeries = historyData["Time Series (Daily)"];

    const dates = Object.keys(timeSeries).slice(0, 30).reverse();
    const prices = dates.map(date => parseFloat(timeSeries[date]["4. close"]));

    if (chart) chart.destroy();

    const ctx = document.getElementById("chart").getContext("2d");
    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [{
          label: `${symbol} Closing Price`,
          data: prices,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Date'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Price (USD)'
            }
          }
        }
      }
    });
  } catch (error) {
    document.getElementById("stock-info").innerHTML = "<p>Error fetching data.</p>";
    console.error(error);
  }
}
