#!/bin/zsh
cd "$(dirname "$0")"
open "http://127.0.0.1:8767/prototype/"
python3 scripts/serve.py --port 8767
