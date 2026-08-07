import argparse
import asyncio
import sys
import os

from src.core.ws_server import run as run_ws


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AngklungineX Service")
    parser.add_argument("--host", type=str, default="localhost", help="Host WebSocket (default: localhost)")
    parser.add_argument("--port", type=int, default=8765, help="Port WebSocket (default: 8765)")
    args = parser.parse_args()

    base_dir = os.path.dirname(os.path.abspath(__file__))

    try:
        asyncio.run(run_ws(host=args.host, port=args.port, base_dir=base_dir))
    except KeyboardInterrupt:
        print("\nExiting service...")
        sys.exit(0)
