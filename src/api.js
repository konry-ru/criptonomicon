const API_KEY = '3df379aa005a2527d7bc50a00816f82e274b21ac02306f8f8206a4dfc692087c';

// TODO: refactor to use URLSearchParams
// Put directly in request string is bad for security
export const loadTicker = tickerName => 
fetch(
	`https://min-api.cryptocompare.com/data/price?fsym=${tickerName}&tsyms=USD&api_key=${API_KEY}`
)
.then(r => r.json());