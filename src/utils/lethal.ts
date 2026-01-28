//////////////////////////////
///          Init          ///
//////////////////////////////
import { BareMuxConnection } from "@mercuryworkshop/bare-mux";

//////////////////////////////
///         Options        ///
//////////////////////////////
const connection = new BareMuxConnection("/bareworker.js");

let wispURL: string;
let transportURL: string;

export let tabCounter: number = 0;
export let currentTab: number = 0;
export let framesElement: HTMLElement;
export let currentFrame: HTMLIFrameElement;
export const addressInput: HTMLInputElement = document.getElementById(
	"address",
) as HTMLInputElement;

const getIcon = (url: string) => {
	const domain = new URL(url).hostname;
	return domain ? `https://favicone.com/${domain}` : "/favicon.ico";
};

window.tabs = [];

const transportOptions: TransportOptions = {
	epoxy:
		"https://unpkg.com/@mercuryworkshop/epoxy-transport@2.1.27/dist/index.mjs",
	libcurl:
		"https://unpkg.com/@mercuryworkshop/libcurl-transport@1.5.0/dist/index.mjs",
};

//////////////////////////////
///           SW           ///
//////////////////////////////
const stockSW = "/ultraworker.js";
const swAllowedHostnames = ["localhost", "127.0.0.1"];

async function registerSW(): Promise<void> {
	if (!navigator.serviceWorker) {
		if (
			location.protocol !== "https:" &&
			!swAllowedHostnames.includes(location.hostname)
		)
			throw new Error("Service workers cannot be registered without https.");

		throw new Error("Your browser doesn't support service workers.");
	}

	await navigator.serviceWorker.register(stockSW);
}


document.addEventListener("DOMContentLoaded", async () => {
	await import("@/scramjet.all.js")
	const { ScramjetController } = window.$scramjetLoadController();
	const scramjet = new ScramjetController({
		files: {
			wasm: "/crasm/scramjet.wasm.wasm",
			all: "/crasm/scramjet.all.js",
			sync: "/crasm/scramjet.sync.js",
		},
		flags: {
			rewriterLogs: false,
			scramitize: false,
			cleanErrors: true,
		},
		siteFlags: {
			"https://worker-playground.glitch.me/.*": {
				serviceworkers: true,
			},
		},
	});
	scramjet.init();
	window.scramjet = scramjet;
	registerSW()
		.then(() => console.log("lethal.js: Service Worker registered"))
		.catch((err) =>
			console.error("lethal.js: Failed to register Service Worker", err),
		);
	new Tab();
})

//////////////////////////////
///        Functions       ///
//////////////////////////////
export function makeURL(
	input: string,
	template = "https://duckduckgo.com/search?q=%s",
): string {
	try {
		return new URL(input).toString();
	} catch (err) { }

	try {
		const url = new URL(`http://${input}`);
		if (url.hostname.includes(".")) return url.toString();
	} catch (err) { }

	return template.replace("%s", encodeURIComponent(input));
}

async function updateBareMux(): Promise<void> {
	if (transportURL != null && wispURL != null) {
		console.log(
			`lethal.js: Setting BareMux to ${transportURL} and Wisp to ${wispURL}`,
		);

		await connection.setTransport(transportURL, [{ wisp: wispURL }]);
	}
}

export async function setTransport(transport: Transport): Promise<void> {
	console.log(`lethal.js: Setting transport to ${transport}`);
	transportURL = transportOptions[transport];
	if (!transportURL) {
		transportURL = transport;
	}

	await updateBareMux();
}

export function getTransport(): string {
	return transportURL;
}

export async function setWisp(wisp: string): Promise<void> {
	console.log(`lethal.js: Setting Wisp to ${wisp}`);
	wispURL = wisp;

	await updateBareMux();
}

export function getWisp(): string {
	return wispURL;
}

export async function getProxied(url: string): Promise<any> {
	if (url.startsWith("bromine://")) {
		return url.replace("bromine://", "/");
	}

	return scramjet.encodeUrl(url);
}

export function setFrames(frames: HTMLElement): void {
	framesElement = frames;
}

export class Tab {
	frame: any;
	tabNumber: number;
	title: string = "New Tab";
	url: string = "bromine://newtab";
	timesErrored: number;
	el: HTMLElement;

	constructor() {
		if (!framesElement) return;
		tabCounter++;
		this.tabNumber = tabCounter;

		this.frame = scramjet.createFrame();
		this.frame.frame.setAttribute("class", "w-full h-full border-0 absolute");
		this.frame.frame.setAttribute("title", "Proxy Frame");
		this.frame.frame.setAttribute("src", "/newtab");
		this.frame.frame.setAttribute("id", `frame-${tabCounter}`);
		framesElement.appendChild(this.frame.frame);

		this.createUI();
		window.tabs.push(this);
		this.switch();

		this.frame.frame.addEventListener("load", () => {
			const url = scramjet.decodeUrl(
				this.frame.frame.contentWindow.location.href,
			);
			this.handleLoad(url);
		});
	}

	createUI() {
		const tabsDiv = document.getElementById("tabs");
		if (!tabsDiv) return;

		const tabEl = document.createElement("div");
		tabEl.className =
			"flex items-center min-w-[8rem] max-w-xs px-4 py-1 hover:bg-surface cursor-pointer transition duration-300 draggable-tab";
		tabEl.dataset.tabId = this.tabNumber;
		tabEl.draggable = true;

		tabEl.innerHTML = `
	      <img class="w-4 h-4 mr-2 rounded" alt="Favicon" src="/favicon.ico" />
	      <span class="tab truncate flex-1 text-sm">${this.title}</span>
	      <button class="ml-2 text-xl focus:outline-none">&times;</button>
	    `;

		tabEl.querySelector("button")?.addEventListener("click", (e) => {
			e.stopPropagation();
			this.close();
		});

		tabEl.addEventListener("click", () => this.switch());

		tabsDiv.appendChild(tabEl);
		this.el = tabEl;
	}

	updateUI() {
		if (!this.el) return;
		const img = this.el.querySelector("img");
		const span = this.el.querySelector(".tab");

		if (img) img.src = this.url ? getIcon(this.url) : "/favicon.ico";
		if (span) span.textContent = this.title || "New Tab";

		window.tabs.forEach((tab) => {
			if (!tab.el) return;
			const isActive = tab.tabNumber === currentTab;
			tab.el.classList.toggle("active", isActive);
			tab.el.classList.toggle("bg-surface", isActive);
			tab.el.classList.toggle("font-medium", isActive);
		});
	}

	switch(): void {
		currentTab = this.tabNumber;
		framesElement
			.querySelectorAll("iframe")
			.forEach((frame) => frame.classList.add("hidden"));
		this.frame.frame.classList.remove("hidden");

		currentFrame = this.frame.frame;
		addressInput.value = scramjet.decodeUrl(
			currentFrame?.contentWindow?.location.href ?? "",
		);
		this.updateUI();
	}

	close(): void {
		this.frame.frame.remove();
		this.el?.remove();
		window.tabs = window.tabs.filter((t) => t.tabNumber !== this.tabNumber);

		if (currentTab === this.tabNumber) {
			if (window.tabs.length > 0) window.tabs[0].switch();
			else newTab();
		}
	}

	handleLoad(url: string): void {
		if (this.tabNumber !== currentTab) return;

		this.title = this.frame.frame?.contentWindow?.document.title || "New Tab";
		this.url = url;

		const doc =
			this.frame.frame.contentDocument ||
			this.frame.frame.contentWindow.document;
		const text = doc.body?.textContent?.toLowerCase() || "";

		const bareErr = text.includes("there are no bare clients");
		const otherErr = doc.querySelector("#errorTitle");

		if (bareErr) {
			if (++this.timesErrored <= 5) {
				console.warn(`Bare client error (${this.timesErrored}/5) → reloading`);
				this.frame.frame.contentWindow.location.reload();
			}
		} else if (otherErr) {
			console.warn(`Iframe error (${++this.timesErrored})`);
		} else {
			this.timesErrored = 0;
		}
		//
		// try {
		//   let history = JSON.parse(localStorage.getItem("history"));
		//   history.push({ url, title: this.title });
		//   localStorage.setItem("history", JSON.stringify(history));
		// } catch {}

		this.updateUI();
		addressInput.value = url;
	}
}

export async function newTab() {
	new Tab();
}

export function switchTab(tabNumber: number): void {
	const tabToSwitchTo = window.tabs.find((tab) => tab.tabNumber === tabNumber);
	if (tabToSwitchTo) {
		tabToSwitchTo.switch();
	} else {
		console.warn(
			`lethal.js: Attempted to switch to non-existent tab #${tabNumber}`,
		);
	}
}

export function closeTab(tabNumber: number): void {
	const tabToClose = window.tabs.find((tab) => tab.tabNumber === tabNumber);

	if (tabToClose) {
		tabToClose.close();

		if (currentTab === tabNumber) {
			if (window.tabs.length > 0) {
				window.tabs[0].switch();
			} else {
				newTab();
			}
		}
	} else {
		console.warn(
			`lethal.js: Attempted to close non-existent tab #${tabNumber}`,
		);
	}
}
