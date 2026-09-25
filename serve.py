#!/usr/bin/env python3
"""خادمٌ محليّ لمنصّة جائزة أداء الصحة · الدورة الثامنة."""
import http.server, socketserver, os, functools

PORT = 5400
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "app")

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()
    def log_message(self, fmt, *args):
        pass

if __name__ == "__main__":
    socketserver.TCPServer.allow_reuse_address = True
    h = functools.partial(Handler, directory=ROOT)
    with socketserver.TCPServer(("127.0.0.1", PORT), h) as httpd:
        print(f"جائزة أداء الصحة  →  http://localhost:{PORT}")
        httpd.serve_forever()
