"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var apiKey = "demo"; // Replace with your Alpha Vantage API key

var stockChartCanvas = document.getElementById("stockChart").getContext("2d");
var stockChart;

function getStockData() {
  var symbol, _ref, _ref2, quoteRes, timeSeriesRes, quoteData, timeSeriesData, quote, series;

  return regeneratorRuntime.async(function getStockData$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          symbol = document.getElementById("search").value.toUpperCase();

          if (symbol) {
            _context.next = 3;
            break;
          }

          return _context.abrupt("return");

        case 3:
          _context.prev = 3;
          _context.next = 6;
          return regeneratorRuntime.awrap(Promise.all([fetch("https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=".concat(symbol, "&apikey=").concat(apiKey)), fetch("https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=".concat(symbol, "&apikey=").concat(apiKey))]));

        case 6:
          _ref = _context.sent;
          _ref2 = _slicedToArray(_ref, 2);
          quoteRes = _ref2[0];
          timeSeriesRes = _ref2[1];
          _context.next = 12;
          return regeneratorRuntime.awrap(quoteRes.json());

        case 12:
          quoteData = _context.sent;
          _context.next = 15;
          return regeneratorRuntime.awrap(timeSeriesRes.json());

        case 15:
          timeSeriesData = _context.sent;
          quote = quoteData["Global Quote"];
          series = timeSeriesData["Time Series (Daily)"];

          if (!(!quote || !series)) {
            _context.next = 21;
            break;
          }

          alert("Invalid symbol or no data found.");
          return _context.abrupt("return");

        case 21:
          updateStockHeader(quote);
          updateChart(series);
          updateWatchlist(symbol, quote);
          _context.next = 29;
          break;

        case 26:
          _context.prev = 26;
          _context.t0 = _context["catch"](3);
          console.error("Error fetching stock data:", _context.t0);

        case 29:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[3, 26]]);
}

function updateStockHeader(quote) {
  document.getElementById("stock-name").textContent = quote["01. symbol"];
  document.getElementById("stock-price").textContent = "$".concat(parseFloat(quote["05. price"]).toFixed(2));
}

function updateChart(series) {
  var labels = Object.keys(series).slice(0, 30).reverse();
  var prices = labels.map(function (date) {
    return parseFloat(series[date]["4. close"]);
  });
  var volumes = labels.map(function (date) {
    return parseInt(series[date]["5. volume"]);
  });
  if (stockChart) stockChart.destroy();
  stockChart = new Chart(stockChartCanvas, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        type: 'line',
        label: "Closing Price",
        data: prices,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        yAxisID: 'y',
        tension: 0.3,
        fill: true
      }, {
        type: 'bar',
        label: "Volume",
        data: volumes,
        backgroundColor: "#e5e7eb",
        yAxisID: 'y1'
      }]
    },
    options: {
      scales: {
        x: {
          title: {
            display: true,
            text: "Date"
          }
        },
        y: {
          position: 'left',
          title: {
            display: true,
            text: "Price (USD)"
          }
        },
        y1: {
          position: 'right',
          title: {
            display: true,
            text: "Volume"
          },
          grid: {
            drawOnChartArea: false
          }
        }
      }
    }
  });
}

function updateWatchlist(symbol, quote) {
  var watchlist = document.getElementById("watchlist"); // Avoid duplicate entries

  if (document.getElementById("watch-".concat(symbol))) return;
  var li = document.createElement("li");
  li.id = "watch-".concat(symbol);
  var price = parseFloat(quote["05. price"]).toFixed(2);
  var change = parseFloat(quote["09. change"]);
  var color = change >= 0 ? '#10b981' : '#ef4444';
  li.innerHTML = "\n    <span>".concat(symbol, "</span>\n    <span style=\"color: ").concat(color, "\">$").concat(price, " (").concat(quote["10. change percent"], ")</span>\n    <button onclick=\"removeFromWatchlist('").concat(symbol, "')\" style=\"margin-left: 10px; background: none; border: none; color: #ef4444; cursor: pointer;\">&times;</button>\n  ");
  watchlist.prepend(li);
}

function removeFromWatchlist(symbol) {
  var li = document.getElementById("watch-".concat(symbol));
  if (li) li.remove();
} // Optional: preload with Apple


window.onload = function () {
  document.getElementById("search").value = "AAPL";
  getStockData();
};