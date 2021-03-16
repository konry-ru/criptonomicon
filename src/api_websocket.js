
const API_KEY = 'd8ed30cc8bba73494b4a9993a9ab47fc88562bee4c5ff7727538e1d02cbcda4f';

const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`);
const AGGREGATE_INDEX = "5";

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

export function subscribeToTickerOnWs(tickerName) {
	sendToWebSocket({
		action: "SubAdd",
		subs: [`5~CCCAGG~${tickerName}~USD`]
	});
}

export function unSubscribeFromTickerOnWs(tickerName) {
	sendToWebSocket({
		action: "SubRemove",
		subs: [`5~CCCAGG~${tickerName}~USD`]
	});
}
export function listenWS (cb) {
    socket.addEventListener("message", e => {
		const { TYPE: type, FROMSYMBOL: currency, PRICE: newPrice } = JSON.parse(e.data);

		if (type !== AGGREGATE_INDEX) {
			return;
		}
		if (!newPrice) {
			return;
		}
        cb(currency, newPrice);
	});

	socket.addEventListener('error', function (event) {
		console.log('Поймал ошибку от ВебСокета ;) ', event);
	});
}