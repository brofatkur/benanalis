const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

if (process.stdout._handle) process.stdout._handle.setBlocking(true);
if (process.stderr._handle) process.stderr._handle.setBlocking(true);

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
  process.exit(1);
});
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
});

const dev = false;
console.log("Initializing next app instance...");
const app = next({ dev, dir: __dirname, hostname: "0.0.0.0", port: 3000 });
const handle = app.getRequestHandler();
const PORT = parseInt(process.env.PORT || "3000", 10);

console.log("Preparing Next.js app in production mode...");
app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  server.listen(PORT, "0.0.0.0", (err) => {
    if (err) {
      console.error("Server listen error:", err);
      return;
    }
    console.log(`> Ready on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error("Failed to prepare Next.js:", err);
});

// Ensure event loop never drains
setInterval(() => {}, 1000 * 60 * 60);
