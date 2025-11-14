importScripts("https://cdn.jsdelivr.net/gh/Bromine-Labs/cdn@main/workerware/workerware.js");
importScripts("https://cdn.jsdelivr.net/gh/Bromine-Labs/cdn@main/alu-adblocker.js");
importScripts("https://cdn.jsdelivr.net/gh/Bromine-Labs/cdn@main/crasm/scramjet.all.js");

if (navigator.userAgent.includes("Firefox")) {
	Object.defineProperty(globalThis, "crossOriginIsolated", {
		value: true,
		writable: true,
	});
}

const { ScramjetServiceWorker } = $scramjetLoadWorker();
const scramjet = new ScramjetServiceWorker();

const ww = new WorkerWare({});

async function handleRequest(event) {
	await scramjet.loadConfig();

	let mwResponse = await ww.run(event)();
	if (mwResponse.includes(null)) return;

	if (scramjet.route(event)) {
		return scramjet.fetch(event);
	}

	return await fetch(event.request);
}

self.addEventListener("fetch", (event) => {
	event.respondWith(handleRequest(event));
});
