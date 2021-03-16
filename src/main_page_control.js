import { updateTickersInStorage } from './api_localstorage';

let isMainPage = false;

const checkMainPageInLS = () => {
	return localStorage.getItem("mainPage") === "true";
}

if (!checkMainPageInLS()) {
	localStorage.setItem("mainPage", "true");
	updateTickersInStorage((tickers) => {
		tickers.forEach(t => t.counter = 0);
	})
	isMainPage = true;
}


export function getIsMainPage() {
	return isMainPage;
}

export const deleteMainPageFromLS = () => {
	localStorage.removeItem("mainPage");
}