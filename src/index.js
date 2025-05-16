const apiKey = "demo"; // Replace with your Alpha Vantage API key
const stockChartCanvas = document.getElementById("stockChart").getContext("2d");
let stockChart;

async function getStockData() {
  const symbol = document.getElementById("search").value.toUpperCase();
  if (!symbol) return;

  try {
    const [quoteRes, timeSeriesRes] = await Promise.all([
      fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`),
      fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`)
    ]);

    const quoteData = await quoteRes.json();
    const timeSeriesData = await timeSeriesRes.json();

    const quote = quoteData["Global Quote"];
    const series = timeSeriesData["Time Series (Daily)"];

    if (!quote || !series) {
      alert("Invalid symbol or no data found.");
      return;
    }

    updateStockHeader(quote);
    updateChart(series);
    updateWatchlist(symbol, quote);
  } catch (error) {
    console.error("Error fetching stock data:", error);
  }
}

function updateStockHeader(quote) {
  document.getElementById("stock-name").textContent = quote["01. symbol"];
  document.getElementById("stock-price").textContent = `$${parseFloat(quote["05. price"]).toFixed(2)}`;
}

function updateChart(series) {
  const labels = Object.keys(series).slice(0, 30).reverse();
  const prices = labels.map(date => parseFloat(series[date]["4. close"]));
  const volumes = labels.map(date => parseInt(series[date]["5. volume"]));

  if (stockChart) stockChart.destroy();

  stockChart = new Chart(stockChartCanvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          type: 'line',
          label: "Closing Price",
          data: prices,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.2)",
          yAxisID: 'y',
          tension: 0.3,
          fill: true
        },
        {
          type: 'bar',
          label: "Volume",
          data: volumes,
          backgroundColor: "#e5e7eb",
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      scales: {
        x: {
          title: { display: true, text: "Date" }
        },
        y: {
          position: 'left',
          title: { display: true, text: "Price (USD)" }
        },
        y1: {
          position: 'right',
          title: { display: true, text: "Volume" },
          grid: { drawOnChartArea: false }
        }
      }
    }
  });
}

function updateWatchlist(symbol, quote) {
  const watchlist = document.getElementById("watchlist");

  // Avoid duplicate entries
  if (document.getElementById(`watch-${symbol}`)) return;

  const li = document.createElement("li");
  li.id = `watch-${symbol}`;

  const price = parseFloat(quote["05. price"]).toFixed(2);
  const change = parseFloat(quote["09. change"]);
  const color = change >= 0 ? '#10b981' : '#ef4444';

  li.innerHTML = `
    <span>${symbol}</span>
    <span style="color: ${color}">$${price} (${quote["10. change percent"]})</span>
    <button onclick="removeFromWatchlist('${symbol}')" style="margin-left: 10px; background: none; border: none; color: #ef4444; cursor: pointer;">&times;</button>
  `;

  watchlist.prepend(li);
}

function removeFromWatchlist(symbol) {
  const li = document.getElementById(`watch-${symbol}`);
  if (li) li.remove();
}

// Optional: preload with Apple
window.onload = () => {
  document.getElementById("search").value = "AAPL";
  getStockData();
};
