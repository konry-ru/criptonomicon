const API_KEY = '3df379aa005a2527d7bc50a00816f82e274b21ac02306f8f8206a4dfc692087c';

const tickersSubscribers = new Map();
const requestIntervals = [];

//  TODO: refactor to use URLSearchParams Put directly in request string is bad for security
export const startRequests = tickersList => {
	if (requestIntervals.length > 0) {
		requestIntervals.forEach(interval => clearInterval(interval));
	}
	const requestInterval = setInterval(() => {
		console.log(tickersSubscribers);
		if(tickersSubscribers.size > 0) {
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
						console.log({ key, value })
	
						tickersSubscribers.get(key).forEach(fn => fn(value))
					});
				})
				.catch(e => console.log("Ошибка обработки данных", e));
		}
	}, 5000);
	requestIntervals.push(requestInterval);
}

export const getTickersList = () =>
	fetch(
		"https://min-api.cryptocompare.com/data/all/coinlist?summary=true"
	)
		.then(r => r.json())
		.catch(e => console.log(e));

export function subscribeToTicker(ticker, cb) {
	const subscribers = tickersSubscribers.get(ticker) || [];
	tickersSubscribers.set(ticker, [...subscribers, cb]);
}

// TODO catch error if subscribers haven't cb
export function unsubscribeFromTicker(ticker, cbName) {
	const subscribers = tickersSubscribers.get(ticker) || [];
	if (cbName) {
		tickersSubscribers.set(
			ticker,
			subscribers.filter(fn => fn.name !== cbName)
		);
	} else {
		tickersSubscribers.delete(ticker);
	}


}

// subscribeToTicker('BTC', () => console.log('Subscribed to BTC!'));
// subscribeToTicker('BTC', () => console.log('Second subscriber to BTC!'));
// subscribeToTicker('ETH', () => console.log('First subscriber to ETH'));
// console.log(tickersSubscribers);
// tickersSubscribers.get('BTC').forEach(fn => fn());
// unsubscribeFromTicker('BTC');
// console.log(tickersSubscribers);
// unsubscribeFromTicker('BTC');