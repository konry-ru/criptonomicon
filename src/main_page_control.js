import {updateTickersInLocalStorage} from './api_localstorage';


const checkMainPageInLS = () => {
    return localStorage.getItem("mainPage") === "true";
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

export const deleteMainPageFromLS = () => {
    localStorage.removeItem("mainPage");
}