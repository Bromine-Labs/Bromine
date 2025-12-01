import { server as wisp } from "@mercuryworkshop/wisp-js/server";
import express from "express";
import { existsSync } from "fs";
import { $ } from "bun";

const PORT = parseInt(process.env.PORT) || 8080;
const NODE_ENV = process.env.NODE_ENV || "production";
const PUBLIC_HOST_WISP = process.env.PUBLIC_HOST_WISP === "true";

// Check if dist exists, if not, use Bun Shell to build
if (!existsSync("./dist")) {
    console.log("Dist directory not found. Running build...");
    await $`bun run build`; 
}

const app = express();

app.use(express.static("dist"));

const server = app.listen(PORT, () => {
    console.log(`Server running in ${NODE_ENV} mode`);
    console.log(`Listening on http://localhost:${PORT}`);

    if (PUBLIC_HOST_WISP) {
        console.log("Wisp hosting ENABLED");
    } else {
        console.log("Wisp hosting DISABLED");
    }
});

server.on("upgrade", (req, socket, head) => {
    if (PUBLIC_HOST_WISP && req.url.startsWith("/wisp")) {
        wisp.routeRequest(req, socket, head);
    } else {
        socket.destroy();
    }
});
