#!/usr/bin/env python3
"""Native messaging host with Unix socket data channel."""

import json
import os
import select
import socket
import struct
import sys
import time

DEBOUNCE_SECS = 5
SOCK_PATH = "/tmp/claude-usage.sock"


def read_native_message(fd):
    raw = b""
    while len(raw) < 4:
        chunk = os.read(fd, 4 - len(raw))
        if not chunk:
            return None
        raw += chunk
    length = struct.unpack("=I", raw)[0]
    data = b""
    while len(data) < length:
        chunk = os.read(fd, length - len(data))
        if not chunk:
            return None
        data += chunk
    return json.loads(data)


def send_native_message(fd, obj):
    encoded = json.dumps(obj).encode("utf-8")
    os.write(fd, struct.pack("=I", len(encoded)))
    os.write(fd, encoded)


def main():
    stdin_fd = sys.stdin.fileno()
    stdout_fd = sys.stdout.fileno()

    try:
        os.unlink(SOCK_PATH)
    except FileNotFoundError:
        pass

    srv = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
    srv.bind(SOCK_PATH)
    srv.listen(5)
    os.chmod(SOCK_PATH, 0o600)

    pending = []
    last_fetch = 0
    last_data = None
    fetch_in_flight = False

    # Initial fetch
    send_native_message(stdout_fd, {"action": "fetch"})
    last_fetch = time.monotonic()
    fetch_in_flight = True

    try:
        while True:
            readable, _, _ = select.select([stdin_fd, srv], [], [])
            for s in readable:
                if s == stdin_fd:
                    msg = read_native_message(stdin_fd)
                    if msg is None:
                        return
                    last_data = json.dumps(msg).encode("utf-8")
                    fetch_in_flight = False
                    for client in pending:
                        try:
                            client.sendall(last_data)
                            client.close()
                        except OSError:
                            pass
                    pending.clear()
                elif s == srv:
                    conn, _ = srv.accept()
                    now = time.monotonic()
                    if now - last_fetch < DEBOUNCE_SECS:
                        try:
                            conn.sendall(last_data or b'{}')
                            conn.close()
                        except OSError:
                            pass
                    else:
                        pending.append(conn)
                        if not fetch_in_flight:
                            send_native_message(stdout_fd, {"action": "fetch"})
                            last_fetch = now
                            fetch_in_flight = True
    finally:
        for client in pending:
            try:
                client.close()
            except OSError:
                pass
        try:
            os.unlink(SOCK_PATH)
        except OSError:
            pass


if __name__ == "__main__":
    main()
