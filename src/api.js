import { listenWS, subscribeToTickerOnWs, unSubscribeFromTickerOnWs } from './api_websocket'
import {
	checkLocalStorage, addTickerInLocalStorage, reduceTickerCounter,
	deleteFromLocalStorage, listenLS
} from './api_localstorage';
import {setMainPageByLS, deleteMainPageFromLS} from './main_page_control';

const tickersHandlers = new Map();
let isMainPage = setMainPageByLS();

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
		deleteMainPageFromLS();
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
	addTickerInLocalStorage(tickerName);
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