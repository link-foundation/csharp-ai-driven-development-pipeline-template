"""Finite offline reproduction of lycheeverse/lychee#2297; pass a binary path."""

import json
from pathlib import Path
import socket
import struct
import subprocess
import sys
import tempfile
import threading

binary = str(Path(sys.argv[1]).resolve())
attempts = []
stop = threading.Event()
with socket.socket() as server:
    server.bind(('127.0.0.1', 0))
    server.listen(4)
    server.settimeout(0.2)

    def reset_connections():
        while not stop.is_set():
            try:
                connection, _ = server.accept()
            except TimeoutError:
                continue
            with connection:
                attempts.append(1)
                connection.setsockopt(socket.SOL_SOCKET, socket.SO_LINGER,
                                      struct.pack('ii', 1, 0))

    thread = threading.Thread(target=reset_connections)
    thread.start()
    try:
        with tempfile.TemporaryDirectory() as directory:
            url = f'https://127.0.0.1:{server.getsockname()[1]}/'
            result = subprocess.run(
                [binary, '--no-progress', '--max-retries', '2',
                 '--retry-wait-time', '1', '--timeout', '2', url],
                cwd=directory, text=True, capture_output=True, check=False)
            print(result.stdout, result.stderr)
            print(json.dumps({'configured_retries': 2, 'connections': len(attempts),
                              'exit_code': result.returncode}))
            assert result.returncode != 0
            assert len(attempts) == 1, 'Upstream retry behavior changed; revisit workaround'
    finally:
        stop.set()
        thread.join()
