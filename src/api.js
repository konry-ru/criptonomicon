import { listenWS, subscribeToTickerOnWs, unSubscribeFromTickerOnWs } from './api_websocket'
import {
	deleteMainPage, checkLocalStorage, updateLocalStorage,
	reduceTickerCounter, deleteFromLocalStorage, setMainPageByLS, listenLS
} from './api_localstorage';

const tickersHandlers = new Map();


let isMainPage = setMainPageByLS();
console.log('I is mainPage ', isMainPage);


// TODO [ ] --- через BroadCastChannel

const callHandlers = (currency, newPrice) => {
	const handlers = tickersHandlers.get(currency) ?? [];
	handlers.forEach(fn => fn(currency, newPrice));
}

if (isMainPage) {
	listenWS((currency, newPrice) => {
		callHandlers(currency, newPrice);
	});

	const listenLocalStorage = setInterval(() => {
		checkLocalStorage((tickerName, flag) => {
			if (flag) {
				subscribeToTickerOnWs(tickerName);
			} else {
				unSubscribeFromTickerOnWs(tickerName);
			}
		})
	}, 3000);

	window.onunload = () => {
		deleteMainPage();
		clearInterval(listenLocalStorage);
	}
}

if (!isMainPage) {
	listenLS((currency, newPrice) => {
		callHandlers(currency, newPrice);
	});
}

export const getTickersList = () =>
	fetch(
		"https://min-api.cryptocompare.com/data/all/coinlist?summary=true"
	)
		.then(r => r.json())
		.catch(e => console.log(e));


export function getTickersFromLocalStorage() {
	const savedTickers = localStorage.getItem("tickers");
	return isMainPage ? JSON.parse(savedTickers) : [];
}

export function subscribeToTicker(tickerName, cb) {
	const subscribers = tickersHandlers.get(tickerName) || [];
	tickersHandlers.set(tickerName, [...subscribers, cb]);
	subscribeToTickerOnWs(tickerName);
	updateLocalStorage(tickerName);
}

export function updateLocalStorageByWs(ticker, price) {
	const savedTickers = JSON.parse(localStorage.getItem("tickers"));
	let tickerForUpdate = savedTickers.find(t => t.name === ticker);
	if (tickerForUpdate) {
		tickerForUpdate.price = price;
	}
	localStorage.setItem("tickers", JSON.stringify(savedTickers));
}

// TODO catch error if subscribers haven't cb
export function unsubscribeFromTicker(tickerName, cbName) {
	const subscribers = tickersHandlers.get(tickerName) || [];
	if (cbName) {
		tickersHandlers.set(
			tickerName,
			subscribers.filter(fn => fn.name !== cbName)
		);
	} else {
		tickersHandlers.delete(tickerName);
		const counter = reduceTickerCounter(tickerName);
		if (counter === 0) {
			deleteFromLocalStorage(tickerName);
			// console.log('Deleting...')
			// unSubscribeFromTickerOnWs(ticker);
		}
	}
}