const API_KEY = 'd8ed30cc8bba73494b4a9993a9ab47fc88562bee4c5ff7727538e1d02cbcda4f';

const tickersHandlers = new Map();
const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`);
const AGGREGATE_INDEX = "5";


socket.addEventListener("message", e => {
	const {TYPE: type, FROMSYMBOL: currency, PRICE: newPrice} = JSON.parse(e.data);

	if(type !== AGGREGATE_INDEX) {
		return;
	}
	const handlers = tickersHandlers.get(currency) ?? [];
	handlers.forEach(fn => fn(currency, newPrice));
});

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
	}, {once: true});
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

export function subscribeToTicker(ticker, cb) {
	const subscribers = tickersHandlers.get(ticker) || [];
	tickersHandlers.set(ticker, [...subscribers, cb]);
	subscribeToTickerOnWs(ticker);
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
	}
	unSubscribeFromTickerOnWs(ticker);
}