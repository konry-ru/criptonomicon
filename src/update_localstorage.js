
export const updateTickersInStorage = (cb) => {
	const savedTickers = JSON.parse(localStorage.getItem("tickers")) || [];
	cb(savedTickers);
	localStorage.setItem("tickers", JSON.stringify(savedTickers));
}

export const changeTickersInStorage = (cb) => {
	const savedTickers = JSON.parse(localStorage.getItem("tickers")) || [];
	const changedTickers = cb(savedTickers);
	localStorage.setItem("tickers", JSON.stringify(changedTickers));
}

export const getTickerCounter = (tickerName) => {
    const savedTickers = JSON.parse(localStorage.getItem("tickers")) || [];
    return savedTickers.find(t => t.name = tickerName).counter;
}

export const getTickersFromStorage = () => (JSON.parse(localStorage.getItem("tickers")) || []);