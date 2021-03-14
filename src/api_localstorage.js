const activeTickers = new Set();

const checkMainPageInLS = () => {
    return localStorage.getItem("mainPage") !== null;
}

export const setMainPageByLS = () => {
    if (!checkMainPageInLS()) {
        localStorage.setItem("mainPage", "true");
        updateTickersInLocalStorage((tickers) => {
            tickers.forEach(t => t.counter = 0);
        })
        return true;
    } else {
        return false;
    }

}

export const updateTickersInLocalStorage = (cb) => {
    const savedTickers = JSON.parse(localStorage.getItem("tickers")) || [];
    cb(savedTickers);
    localStorage.setItem("tickers", JSON.stringify(savedTickers));
}


export const deleteMainPage = () => {
    localStorage.removeItem("mainPage");
}


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

export const reduceTickerCounter = (tickerName) => {
    const savedTickers = JSON.parse(localStorage.getItem("tickers")) || [];
    const ticker = savedTickers.find(t => t.name === tickerName);
    console.log('Уменьшаем на 1 счетчик ', ticker);
    ticker.counter--;
    localStorage.setItem("tickers", JSON.stringify(savedTickers));
    return ticker.counter;
}

export const listenLS = (cb) => {
    window.addEventListener('storage', (evt) => {
        const tickersStorage = JSON.parse(evt.newValue);
        tickersStorage.forEach((ticker) => {
            cb(ticker.name, ticker.price);
        });
    });
}

export function updateLocalStorage(tickerName) {
    activeTickers.add(tickerName);
    const savedTickers = JSON.parse(localStorage.getItem("tickers"));
    const tickerInStorage = savedTickers.find(t => t.name === tickerName);
    if (tickerInStorage) {
        tickerInStorage.counter++;
    } else {
        savedTickers.push({ name: tickerName, price: "--", counter: 1 });
    }
    localStorage.setItem("tickers", JSON.stringify(savedTickers));
}

export function deleteFromLocalStorage(tickerName) {
    const savedTickers = JSON.parse(localStorage.getItem("tickers"));
    const updatedTickers = savedTickers.filter(t =>
        (t.name !== tickerName));
    console.log(updatedTickers)
    localStorage.setItem("tickers", JSON.stringify(updatedTickers));
}