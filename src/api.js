const API_KEY = 'd8ed30cc8bba73494b4a9993a9ab47fc88562bee4c5ff7727538e1d02cbcda4f';

const tickersHandlers = new Map();
const activeTickers = new Set();
const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`);
const AGGREGATE_INDEX = "5";

let isMainPage = false;

// TODO [ ] (5 <заказчик>) Добавить возможность открытия приложения в новых вкладках
// TODO [ ] --- через localStorage (вынести работу с localstorage in api.js)
// TODO [ ] --- через BroadCastChannel

const updateTickersInLocalStorage = (cb) => {
	const savedTickers = JSON.parse(localStorage.getItem("tickers")) || [];
	cb(savedTickers);
	localStorage.setItem("tickers", JSON.stringify(savedTickers));
}

const setMainPage = () => {
	isMainPage = true;
	localStorage.setItem("mainPage", "true");
	updateTickersInLocalStorage((tickers) => {
		tickers.forEach(t => t.counter = 0);
	})
}

const deleteMainPage = () => {
	localStorage.removeItem("mainPage");
}

if (!localStorage.getItem("mainPage")) {
	setMainPage()
}

const checkLocalStorage = () => {
	const savedTickers = JSON.parse(localStorage.getItem("tickers")) || [];
	savedTickers.forEach(ticker => {
		if (!activeTickers.has(ticker.name)) {
			subscribeToTickerOnWs(ticker.name);
		}
	});
	activeTickers.forEach(tickerName => {
		if (!savedTickers.find(t => t.name === tickerName)) {
			activeTickers.delete(tickerName);
			unSubscribeFromTickerOnWs(tickerName);
		}
	})
}

const reduceTickerCounter = (tickerName) => {
	const savedTickers = JSON.parse(localStorage.getItem("tickers")) || [];
	const ticker = savedTickers.find(t => t.name === tickerName);
	return --ticker.counter;
}

console.log('I am a main page :)', isMainPage);

if (isMainPage) {
	socket.addEventListener("message", e => {
		const { TYPE: type, FROMSYMBOL: currency, PRICE: newPrice } = JSON.parse(e.data);

		if (type !== AGGREGATE_INDEX) {
			return;
		}
		if (!newPrice) {
			return;
		}
		const handlers = tickersHandlers.get(currency) ?? [];
		handlers.forEach(fn => fn(currency, newPrice));
		updateLocalStorageByWs(currency, newPrice);
	});

	socket.addEventListener('error', function (event) {
		console.log('Поймал ошибку от ВебСокета ;) ', event);
	});

	const listenLocalStorage = setInterval(() => {
		checkLocalStorage();
	}, 3000);

	window.onunload = () => {
		deleteMainPage();
		clearInterval(listenLocalStorage);
	}
}

if (!isMainPage) {
	window.addEventListener('storage', (evt) => {
		const tickersStorage = JSON.parse(evt.newValue);
		tickersStorage.forEach((ticker) => {
			const handlers = tickersHandlers.get(ticker.name) ?? [];
			handlers.forEach(fn => fn(ticker.name, ticker.price));
		});
	});
}


function updateLocalStorageByWs(ticker, price) {
	const savedTickers = JSON.parse(localStorage.getItem("tickers"));
	let tickerForUpdate = savedTickers.find(t => t.name === ticker);
	if (tickerForUpdate) {
		tickerForUpdate.price = price;
	}
	localStorage.setItem("tickers", JSON.stringify(savedTickers));
}

function updateLocalStorage(ticker) {
	const savedTickers = JSON.parse(localStorage.getItem("tickers"));
	const tickerInStorage = savedTickers.find(t => t.name === ticker);
	if (tickerInStorage) {
		tickerInStorage.counter++;
	} else {
		savedTickers.push({ name: ticker, price: "--", counter: 1 });
	}
	localStorage.setItem("tickers", JSON.stringify(savedTickers));
}

function deleteFromLocalStorage(tickerName) {
	const savedTickers = JSON.parse(localStorage.getItem("tickers"));
	const updatedTickers = savedTickers.filter(t =>
		(t.name !== tickerName));
	console.log(updatedTickers)
	localStorage.setItem("tickers", JSON.stringify(updatedTickers));
}

export const getTickersList = () =>
	fetch(
		"https://min-api.cryptocompare.com/data/all/coinlist?summary=true"
	)
		.then(r => r.json())
		.catch(e => console.log(e));


function sendToWebSocket(message) {
	const stringifiedMessage = JSON.stringify(message);
	if (socket.readyState === WebSocket.OPEN) {
		socket.send(stringifiedMessage);
		return;
	}
	socket.addEventListener("open", () => {
		socket.send(stringifiedMessage);
	}, { once: true });
}

function subscribeToTickerOnWs(tickerName) {
	activeTickers.add(tickerName);
	sendToWebSocket({
		action: "SubAdd",
		subs: [`5~CCCAGG~${tickerName}~USD`]
	});
}

function unSubscribeFromTickerOnWs(tickerName) {
	activeTickers.delete(tickerName)
	sendToWebSocket({
		action: "SubRemove",
		subs: [`5~CCCAGG~${tickerName}~USD`]
	});
}

console.log(isMainPage);

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
		if (reduceTickerCounter(tickerName) === 0) {
			deleteFromLocalStorage(tickerName);
			// console.log('Deleting...')
			// unSubscribeFromTickerOnWs(ticker);
		}
	}
}