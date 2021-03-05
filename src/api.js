const API_KEY = '3df379aa005a2527d7bc50a00816f82e274b21ac02306f8f8206a4dfc692087c';

const tickersSubscribers = new Map();
const requestIntervals = [];

//  TODO: refactor to use URLSearchParams Put directly in request string is bad for security
export const startRequests = tickersList => {
	if(requestIntervals.length > 0) {
		requestIntervals.forEach(interval => clearInterval(interval));
	}
	const requestInterval = setInterval(() => {
		console.log(tickersSubscribers);
		fetch(
			`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${tickersList.join(',')}&tsyms=USD&api_key=${API_KEY}`
		)
			.then(r => r.json())
			.catch(e => console.log("Ошибка из запроса к серверу", e))
			.then(rowData =>
				Object.fromEntries(
					Object.entries(rowData).map(([ticker, data]) => [ticker, data.USD])
				)
			)
			.then(res => {
				Object.entries(res).forEach(([key, value]) => {
					console.log({key, value})

					tickersSubscribers.get(key).forEach(fn => fn(value))
				});
			})
			.catch(e => console.log("Ошибка обработки данных", e));
	}, 5000);
	requestIntervals.push(requestInterval);
}

export const getTickersList = () =>
	fetch(
		"https://min-api.cryptocompare.com/data/all/coinlist?summary=true"
	)
		.then(r => r.json())
		.catch(e => console.log(e));

// TODO Can't delete concrete subscriber for ex. by change graph
export function subscribeToTicker(ticker, cb) {
	if (tickersSubscribers.has(ticker)) {
		tickersSubscribers.set(ticker, [...tickersSubscribers.get(ticker), cb]);
	} else {
		tickersSubscribers.set(ticker, [cb]);
	}
}

export function unsubscribeFromTicker(ticker) {
	tickersSubscribers.delete(ticker);
}

// subscribeToTicker('BTC', () => console.log('Subscribed to BTC!'));
// subscribeToTicker('BTC', () => console.log('Second subscriber to BTC!'));
// subscribeToTicker('ETH', () => console.log('First subscriber to ETH'));
// console.log(tickersSubscribers);
// tickersSubscribers.get('BTC').forEach(fn => fn());
// unsubscribeFromTicker('BTC');
// console.log(tickersSubscribers);
// unsubscribeFromTicker('BTC');