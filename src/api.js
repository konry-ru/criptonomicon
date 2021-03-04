const API_KEY = '3df379aa005a2527d7bc50a00816f82e274b21ac02306f8f8206a4dfc692087c';

// TODO: refactor to use URLSearchParams
// Put directly in request string is bad for security
export const loadTickers = tickersList => 
fetch(
	`https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=${tickersList.join(',')}&api_key=${API_KEY}`
)
.then(r => r.json())
.then(rowData => Object.entries(rowData).map(([ticker, price]) => [ticker, 1 / price]));

export const getTickersList = () =>
fetch(
	"https://min-api.cryptocompare.com/data/all/coinlist?summary=true"
)
.then(r => r.json())
.catch(e => console.log(e));