const activeTickers = new Set();

// TODO API metods must be max short.
// TODO API и их названия не должны говорить о внутренней реализации
// TODO вся внутренняя логика должна быть во внтренних функциях.

export const reduceTickerCounter = (tickerName) => {
	const savedTickers = JSON.parse(localStorage.getItem("tickers")) || [];
	const ticker = savedTickers.find(t => t.name === tickerName);
	console.log('Уменьшаем на 1 счетчик ', ticker);
	ticker.counter--;
	localStorage.setItem("tickers", JSON.stringify(savedTickers));
	return ticker.counter;
}


export const updateTickersInStorage = (cb) => {
	const savedTickers = JSON.parse(localStorage.getItem("tickers")) || [];
	cb(savedTickers);
	localStorage.setItem("tickers", JSON.stringify(savedTickers));
}


const addNewTickerInLocalStorage = (tickerName) => {
	const savedTickers = JSON.parse(localStorage.getItem("tickers")) || [];
	const tickerInStorage = savedTickers.find(t => t.name === tickerName);
	if (tickerInStorage) {
		tickerInStorage.counter++;
	} else {
		savedTickers.push({ name: tickerName, price: "--", counter: 1 });
	}
	localStorage.setItem("tickers", JSON.stringify(savedTickers));
}

export function addTickerInStorage(tickerName) {
	activeTickers.add(tickerName);
	addNewTickerInLocalStorage(tickerName);
}

export function deleteFromLocalStorage(tickerName) {
	const savedTickers = JSON.parse(localStorage.getItem("tickers"));
	const updatedTickers = savedTickers.filter(t =>
		(t.name !== tickerName));
	console.log(updatedTickers)
	localStorage.setItem("tickers", JSON.stringify(updatedTickers));
}

//*  Функция проверяет появление и удаление тикеров в localstorage
//*  Это нужно для главной страницы, которая не получает событий изменения в ls.
export const checkLocalStorage = (cb) => {
	const savedTickers = JSON.parse(localStorage.getItem("tickers")) || [];
	savedTickers.forEach(ticker => {
		if (!activeTickers.has(ticker.name)) {
			activeTickers.add(ticker.name);
			cb(ticker.name, true);
		}
	});
	activeTickers.forEach(tickerName => {
		if (!savedTickers.find(t => t.name === tickerName)) {
			activeTickers.delete(tickerName);
			cb(tickerName, false);
		}
	})
}