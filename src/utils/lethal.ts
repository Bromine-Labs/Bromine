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
let proxyOption: string;

export let tabCounter: number = 0;
export let currentTab: number = 0;
export let framesElement: HTMLElement;
export let currentFrame: HTMLIFrameElement;
export const addressInput: HTMLInputElement = document.getElementById(
	"address",
) as HTMLInputElement;

// @ts-ignore
await import("@/assets/scram/scramjet.all.js");

const { ScramjetController } = window.$scramjetLoadController();

const scramjet = new ScramjetController({
	files: {
		wasm: "/scram/scramjet.wasm.wasm",
		all: "/scram/scramjet.all.js",
		sync: "/scram/scramjet.sync.js",
	},
	flags: {
		rewriterLogs: false,
		naiiveRewriter: false,
		scramitize: false,
	},
	siteFlags: {
		"https://www.google.com/(search|sorry).*": {
			naiiveRewriter: true,
		},
	},
});

scramjet.init();

const transportOptions: TransportOptions = {
	epoxy:
		"https://unpkg.com/@mercuryworkshop/epoxy-transport@2.1.27/dist/index.mjs",
	libcurl:
		"https://unpkg.com/@mercuryworkshop/libcurl-transport@1.5.0/dist/index.mjs",
};

//////////////////////////////
///           SW           ///
//////////////////////////////
const stockSW = "./ultraworker.js";
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


if (window.self === window.top) {

	requestIdleCallback(() => {
			registerSW()
				.then(() => console.log("lethal.js: Service Worker registered"))
				.catch((err) =>
					console.error("lethal.js: Failed to register Service Worker", err),
				);
        });
}


//////////////////////////////
///        Functions       ///
//////////////////////////////
export function makeURL(
	input: string,
	template = "https://search.brave.com/search?q=%s",
): string {
	try {
		return new URL(input).toString();
	} catch (err) {}

	const url = new URL(`http://${input}`);
	if (url.hostname.includes(".")) return url.toString();

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

export async function setProxy(proxy: string): Promise<void> {
	console.log(`lethal.js: Setting proxy backend to ${proxy}`);
	if (proxy === "uv") {
		import(
			// @ts-ignore
			"https://unpkg.com/@titaniumnetwork-dev/ultraviolet@3.2.10/dist/uv.bundle.js"
		);

		// @ts-ignore
		import("@/assets/uv.config.js");
	}
	proxyOption = proxy;
}

export function getProxy(): string {
	return proxyOption;
}

export async function getProxied(input: string): Promise<any> {
	const url = makeURL(input);

	if (proxyOption === "scram") return scramjet.encodeUrl(url);

	return window.__uv$config.prefix + window.__uv$config.encodeUrl(url);
}

export function setFrames(frames: HTMLElement): void {
	framesElement = frames;
}

export class Tab {
	frame: HTMLIFrameElement;
	tabNumber: number;

	constructor() {
		tabCounter++;
		this.tabNumber = tabCounter;

		this.frame = document.createElement("iframe");
		this.frame.setAttribute("class", "w-full h-full border-0 fixed");
		this.frame.setAttribute("title", "Proxy Frame");
		this.frame.setAttribute("src", "/newtab");
		this.frame.setAttribute("loading", "lazy");

		this.frame.setAttribute("id", `frame-${tabCounter}`);
		framesElement.appendChild(this.frame);

		this.switch();

		this.frame.addEventListener("load", () => {
			this.handleLoad();
		});

		document.dispatchEvent(
			new CustomEvent("new-tab", {
				detail: {
					tabNumber: tabCounter,
				},
			}),
		);
	}

	switch(): void {
		currentTab = this.tabNumber;
		let frames = framesElement.querySelectorAll("iframe");
		let framesArr = [...frames];
		framesArr.forEach((frame) => {
			frame.classList.add("hidden");
		});
		this.frame.classList.remove("hidden");

		currentFrame = document.getElementById(
			`frame-${this.tabNumber}`,
		) as HTMLIFrameElement;

		addressInput.value = decodeURIComponent(
			(currentFrame?.contentWindow?.location.href ?? "")
				.split("/")
				.pop() as string,
		);

		document.dispatchEvent(
			new CustomEvent("switch-tab", {
				detail: {
					tabNumber: this.tabNumber,
				},
			}),
		);
	}

	close(): void {
		this.frame.remove();

		document.dispatchEvent(
			new CustomEvent("close-tab", {
				detail: {
					tabNumber: this.tabNumber,
				},
			}),
		);
	}

	handleLoad(): void {
		if (this.tabNumber !== currentTab) return;
		let url = decodeURIComponent(
			this.frame?.contentWindow?.location.href.split("/").pop() as string,
		);
		let title = this.frame?.contentWindow?.document.title;

		let history = localStorage.getItem("history")
			? JSON.parse(localStorage.getItem("history") as string)
			: [];
		history = [...history, { url: url, title: title }];
		localStorage.setItem("history", JSON.stringify(history));

		document.dispatchEvent(
			new CustomEvent("url-changed", {
				detail: {
					tabId: currentTab,
					title: title,
					url: url,
				},
			}),
		);

		if (url === "newtab") url = "bromine://newtab";

		addressInput.value = url;
	}
}

export async function newTab() {
	new Tab();
}

export function switchTab(tabNumber: number): void {
	let frames = framesElement.querySelectorAll("iframe");
	let framesArr = [...frames];
	framesArr.forEach((frame) => {
		if (frame.id != `frame-${tabNumber}`) frame.classList.add("hidden");
		else frame.classList.remove("hidden");
	});

	currentTab = tabNumber;
	currentFrame = document.getElementById(
		`frame-${tabNumber}`,
	) as HTMLIFrameElement;

	addressInput.value = decodeURIComponent(
		(currentFrame?.contentWindow?.location.href ?? "")
			.split("/")
			.pop() as string,
	);

	document.dispatchEvent(
		new CustomEvent("switch-tab", {
			detail: {
				tabNumber: tabNumber,
			},
		}),
	);
}

export function closeTab(tabNumber: number): void {
	let frames = framesElement.querySelectorAll("iframe");
	let framesArr = [...frames];
	framesArr.forEach((frame) => {
		if (frame.id === `frame-${tabNumber}`) {
			frame.remove();
		}
	});

	if (currentTab === tabNumber) {
		const otherFrames = framesElement.querySelectorAll("iframe");
		if (otherFrames.length > 0) {
			switchTab(parseInt(otherFrames[0].id.replace("frame-", "")));
		} else {
			newTab();
		}
	}

	document.dispatchEvent(
		new CustomEvent("close-tab", {
			detail: {
				tabNumber: tabNumber,
			},
		}),
	);
}
