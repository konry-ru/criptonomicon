import { listenWS, subscribeToTickerOnWs, unSubscribeFromTickerOnWs } from './api_websocket'
import {listenLS} from './localstorage_listener';
import { addTickerInStorage, reduceTickerCounter, deleteFromStorage, syncDataWithStorage } from './api_storage';
import {getIsMainPage, deleteMainPageFromLS} from './main_page_control';
import { getTickerCounter } from './update_localstorage';

const tickersHandlers = new Map();
let isMainPage = getIsMainPage();

console.log('Main page', isMainPage);

// TODO [ ] --- через BroadCastChannel

const callHandlers = (currency, newPrice) => {
	const handlers = tickersHandlers.get(currency) ?? [];
	handlers.forEach(fn => fn(currency, newPrice));
}

if (isMainPage) {
	console.log('I am main :)');
	listenWS((currency, newPrice) => {
		callHandlers(currency, newPrice);
	});

	const listenLocalStorage = setInterval(() => {
		syncDataWithStorage((tickerName, flag) => {
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
	addTickerInStorage(tickerName);
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
		reduceTickerCounter(tickerName);
		const counter = getTickerCounter();
		if (counter === 0) {
			deleteFromStorage(tickerName);
		}
	}
}