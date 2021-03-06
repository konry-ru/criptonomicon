const API_KEY = '3df379aa005a2527d7bc50a00816f82e274b21ac02306f8f8206a4dfc692087c';

const tickersHandlers = new Map();

//  TODO: refactor to use URLSearchParams Put directly in request string is bad for security
const updateTickers = () => {
	if (tickersHandlers.size === 0) {
		return;
	}
	console.log(tickersHandlers);
	fetch(
		`https://min-api.cryptocompare.com/data/pricemulti?fsyms=
		${[...tickersHandlers.keys()]
			.join(',')
		}
			&tsyms=USD&api_key=${API_KEY}`
	)
		.then(r => r.json())
		.catch(e => console.log("Ошибка из запроса к серверу", e))
		.then(rowData => {
			const newTickers = Object.entries(rowData)
				.map(([ticker, data]) => [ticker, data.USD]);
			console.log(newTickers);
			return newTickers.forEach(([key, value]) =>
				tickersHandlers.get(key).forEach(fn => fn(value)));
		}
		)
		.catch(e => console.log("Ошибка обработки данных", e));
}

export const getTickersList = () =>
	fetch(
		"https://min-api.cryptocompare.com/data/all/coinlist?summary=true"
	)
		.then(r => r.json())
		.catch(e => console.log(e));

export function subscribeToTicker(ticker, cb) {
	const subscribers = tickersHandlers.get(ticker) || [];
	tickersHandlers.set(ticker, [...subscribers, cb]);
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


}

setInterval(() => {
	updateTickers()
}
	, 5000);