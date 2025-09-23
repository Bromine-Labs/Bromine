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


const openRequest = indexedDB.open('spoobland', 1);

openRequest.onsuccess = function() {
    const db = openRequest.result;

    try {
        const transaction = db.transaction("spooblanda", 'readonly');
        const store = transaction.objectStore("spooblanda");
        const getRequest = store.get("spooblandia");


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

