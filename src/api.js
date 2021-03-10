const API_KEY = 'd8ed30cc8bba73494b4a9993a9ab47fc88562bee4c5ff7727538e1d02cbcda4f';

const tickersHandlers = new Map();
const tickersHandlersList = [];
const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`);
const AGGREGATE_INDEX = "5";
const TOO_MANY_SOCETS_PER_CLIENT = "429";

// TODO [ ] (5 <заказчик>) Добавить возможность открытия приложения в новых вкладках
// TODO [ ] --- через localStorage (вынести работу с localstorage in api.js)
// TODO [ ] --- через BroadCastChannel


socket.addEventListener("message", e => {
	const { TYPE: type, FROMSYMBOL: currency, PRICE: newPrice } = JSON.parse(e.data);

	if (type === TOO_MANY_SOCETS_PER_CLIENT) {
		switchToLocalStorage();
		return;
	}

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
	console.log('WebSocket error: ', event);
});

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
	if (!savedTickers.find(t => t.name === ticker)) {
		savedTickers.push({ name: ticker, price: "--" });
	}
	localStorage.setItem("tickers", JSON.stringify(savedTickers));
}

function deleteFromLocalStorage(ticker) {
	const savedTickers = JSON.parse(localStorage.getItem("tickers"));
	const updatedTickers = savedTickers.filter(t => t.name !== ticker);
	localStorage.setItem("tickers", JSON.stringify(updatedTickers));
}

const switchToLocalStorage = () => {
	window.addEventListener('storage', (evt) => {
		const tickersStorage = JSON.parse(evt.newValue);
		const tickersStorageKeys = tickersStorage.map(ticker => ticker.name);
		console.log(tickersStorageKeys)
		console.log(tickersHandlers.keys());
		for (const key of tickersHandlers.keys()) {
			console.log(key)
			console.log(tickersStorageKeys.includes(key))
			if (!(tickersStorageKeys.includes(key))) {
				tickersHandlers.delete(key);
				console.log(tickersHandlers)
			}
		}
		tickersStorage.forEach((ticker) => {
			if (!tickersHandlers.has(ticker.name)) {
				tickersHandlers.set(ticker.name, tickersHandlersList);
			}
			const handlers = tickersHandlers.get(ticker.name) ?? [];
			handlers.forEach(fn => fn(ticker.name, ticker.price));
		});
	});
}

export const setHandlerForNewTickers = (cb) => {
	tickersHandlersList.push(cb);
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

function subscribeToTickerOnWs(ticker) {
	sendToWebSocket({
		action: "SubAdd",
		subs: [`5~CCCAGG~${ticker}~USD`]
	});
}

function unSubscribeFromTickerOnWs(ticker) {
	sendToWebSocket({
		action: "SubRemove",
		subs: [`5~CCCAGG~${ticker}~USD`]
	});
}

export function getTickersFromLocalStorage() {
	const savedTickers = localStorage.getItem("tickers");
	return JSON.parse(savedTickers);
}

export function subscribeToTicker(ticker, cb) {
	const subscribers = tickersHandlers.get(ticker) || [];
	tickersHandlers.set(ticker, [...subscribers, cb]);
	subscribeToTickerOnWs(ticker);
	updateLocalStorage(ticker);
	console.log(tickersHandlers);
}

// TODO catch error if subscribers haven't cb
export function unsubscribeFromTicker(ticker, cbName) {
	const subscribers = tickersHandlers.get(ticker) || [];
	if (cbName) {
		tickersHandlers.set(
			ticker,
			subscribers.filter(fn => fn.name !== cbName)
		);
	} else {
		tickersHandlers.delete(ticker);
		deleteFromLocalStorage(ticker);
		console.log('Deleting...')
	}
	unSubscribeFromTickerOnWs(ticker);
}