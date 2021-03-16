import {getIsMainPage} from './main_page_control';
import {listenWS} from './api_websocket';

let isMainPage = getIsMainPage();

const updateLocalStorageByWs = (ticker, price) => {
	const savedTickers = JSON.parse(localStorage.getItem("tickers"));
	let tickerForUpdate = savedTickers.find(t => t.name === ticker);
	if (tickerForUpdate) {
			tickerForUpdate.price = price;
	}
	localStorage.setItem("tickers", JSON.stringify(savedTickers));
}

if (isMainPage) {
	listenWS((currency, newPrice) => {
		updateLocalStorageByWs(currency, newPrice);
	});
}

export const listenLS = (cb) => {
	window.addEventListener('storage', (evt) => {
			const tickersStorage = JSON.parse(evt.newValue);
			tickersStorage.forEach((ticker) => {
					cb(ticker.name, ticker.price);
			});
	});
}