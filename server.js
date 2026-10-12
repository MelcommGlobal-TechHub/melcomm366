const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const mimeTypes = {
".html": "text/html; charset=utf-8",
".css": "text/css; charset=utf-8",
".js": "text/javascript; charset=utf-8",
".json": "application/json; charset=utf-8",
".png": "image/png",
".jpg": "image/jpeg",
".jpeg": "image/jpeg",
".svg": "image/svg+xml",
".ico": "image/x-icon",
".webp": "image/webp",
".txt": "text/plain; charset=utf-8"
};

const server = http.createServer((req, res) => {
const pathname = decodeURIComponent(
new URL(req.url, "http://${req.headers.host || "localhost"}").pathname
);

const requestedFile = pathname === "/"
? "index.html"
: pathname.replace(/^/+/, "");

const filePath = path.resolve(ROOT, requestedFile);

if (!filePath.startsWith(ROOT + path.sep) && filePath !== path.join(ROOT, "index.html")) {
res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
return res.end("403 - Forbidden");
}

fs.readFile(filePath, (error, data) => {
if (error) {
res.writeHead(error.code === "ENOENT" ? 404 : 500, {
"Content-Type": "text/plain; charset=utf-8"
});
return res.end(error.code === "ENOENT" ? "404 - File not found" : "500 - Server error");
}

const contentType = mimeTypes[path.extname(filePath).toLowerCase()]
  || "application/octet-stream";

res.writeHead(200, {
  "Content-Type": contentType,
  "X-Content-Type-Options": "nosniff"
});

res.end(data);

});
});

server.listen(PORT, "0.0.0.0", () => {
console.log("AI Africa is running on port ${PORT}");
});