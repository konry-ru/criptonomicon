const API_KEY = '3df379aa005a2527d7bc50a00816f82e274b21ac02306f8f8206a4dfc692087c';

// TODO: refactor to use URLSearchParams
// Put directly in request string is bad for security
export const loadTickers = tickersList => 
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
.catch(e => console.log("Ошибка обработки данных", e));

export const getTickersList = () =>
fetch(
	"https://min-api.cryptocompare.com/data/all/coinlist?summary=true"
)
.then(r => r.json())
.catch(e => console.log(e));