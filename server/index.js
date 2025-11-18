
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { server as wisp } from "@mercuryworkshop/wisp-js/server";

const PORT = parseInt(process.env.PORT) || 4040;
const HOST = process.env.HOST || "0.0.0.0";
const NODE_ENV = process.env.NODE_ENV || "production";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, "dist");

const app = express();

app.use(express.static('dist'))
// Start HTTP server
const server = app.listen(PORT, HOST, () => {
	console.log(`Wisp-only server running in ${NODE_ENV} mode`);
	console.log(`Listening on http://${HOST}:${PORT}`);
});

server.on("upgrade", (req, socket, head) => {
	if (req.url.startsWith("/wisp")) {
		wisp.routeRequest(req, socket, head);
	} else {
		socket.destroy();
	}
});


