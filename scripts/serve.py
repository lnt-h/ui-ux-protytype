#!/usr/bin/env python3
"""Local review server; loopback only. No install or external dependencies."""
import argparse
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from functools import partial

parser=argparse.ArgumentParser(description='Open the GoNarra V7 prototype on localhost.')
parser.add_argument('--port',type=int,default=8767)
args=parser.parse_args()
root=Path(__file__).resolve().parent.parent
print(f'GoNarra V7: http://127.0.0.1:{args.port}/prototype/\nDocumentation: http://127.0.0.1:{args.port}/',flush=True)
ThreadingHTTPServer(('127.0.0.1',args.port),partial(SimpleHTTPRequestHandler,directory=str(root))).serve_forever()
