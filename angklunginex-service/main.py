import argparse
import sys
from src.core.detector import main_loop

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AngklungineX Service")
    parser.add_argument("--port", type=str, default=None, help="Serial port for Arduino")
    parser.add_argument("--camera", type=int, default=None,
                        help="Index kamera (default: pilih manual)")
    args = parser.parse_args()

    try:
        main_loop(port=args.port, camera=args.camera)
    except KeyboardInterrupt:
        print("\nExiting service...")
        sys.exit(0)
