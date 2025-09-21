importScripts("/workerware/workerware.js")
importScripts("/alu-adblocker.js")
importScripts("/scram/scramjet.all.js");


if (navigator.userAgent.includes("Firefox")) {
	Object.defineProperty(globalThis, "crossOriginIsolated", {
		value: true,
		writable: true,
	})
}

const { ScramjetServiceWorker } = $scramjetLoadWorker();
const scramjet = new ScramjetServiceWorker();
(async function () {
	await scramjet.loadConfig();
})();
const ww = new WorkerWare({});



if (navigator.userAgent.includes("Firefox")) {
	Object.defineProperty(globalThis, "crossOriginIsolated", {
		value: true,
		writable: true
	});
}


const openRequest = indexedDB.open(DB_NAME, 1);

openRequest.onsuccess = function() {
    const db = openRequest.result;

    try {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const getRequest = store.get(SETTING_KEY);


        getRequest.onsuccess = function() {
            const isEnabled = getRequest.result;

            if (isEnabled === true) {
                console.log("[SW] Setting is 'true'. Activating adblock plugin.");
                ww.use({
		  							function: self.adblockExt.filterRequest,
                    events: ["fetch"],
                    name: "Adblock",
                });
            }
        };
    } catch {}
};

async function handleRequest(event) {
	let mwResponse = await ww.run(event)();
	if (mwResponse.includes(null))
		return;


	if (scramjet.route(event)) 
		return scramjet.fetch(event)

	return await fetch(event.request)
}

self.addEventListener("fetch", (event) => {
	event.respondWith(handleRequest(event))
})

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
