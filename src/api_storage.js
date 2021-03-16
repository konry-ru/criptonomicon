import {
	updateTickersInStorage, changeTickersInStorage, getTickersFromStorage
} from './update_localstorage';

const activeTickers = new Set();

// TODO API metods must be max short.
// TODO API и их названия не должны говорить о внутренней реализации
// TODO вся внутренняя логика должна быть во внтренних функциях.

const counterDecrement = (savedTickers, tickerName) => {
	const ticker = savedTickers.find(t => t.name === tickerName);
	ticker.counter--;
}

const saveTicker = (savedTickers, tickerName) => {
	const tickerInStorage = savedTickers.find(t => t.name === tickerName);
	if (tickerInStorage) {
		tickerInStorage.counter++;
	} else {
		savedTickers.push({ name: tickerName, price: "--", counter: 1 });
	}
}

const deleteTicker = (savedTickers, tickerName) => {
	const updatedTickers = savedTickers.filter(t =>
		(t.name !== tickerName));
	return updatedTickers;
}

export const reduceTickerCounter = (tickerName) => {
	updateTickersInStorage((savedTickers) => {
		counterDecrement(savedTickers, tickerName)
	})
}

export function addTickerInStorage(tickerName) {
	activeTickers.add(tickerName);
	updateTickersInStorage((savedTickers) => {
		saveTicker(savedTickers, tickerName);
	});
}

export function deleteFromStorage(tickerName) {
	changeTickersInStorage((savedTickers) => {
		deleteTicker(savedTickers, tickerName);
	});
}

//*  Функция проверяет появление и удаление тикеров в localstorage
//*  Это нужно для главной страницы, которая не получает событий изменения в ls.
export const syncDataWithStorage = (cb) => {
	const savedTickers = getTickersFromStorage();
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