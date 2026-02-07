#!/usr/bin/env sh
set -eu

PIDFILE="${PIDFILE:-.serve.pid}"

if [ ! -f "$PIDFILE" ]; then
  echo "No pidfile found: $PIDFILE"
  exit 1
fi

PID="$(cat "$PIDFILE" 2>/dev/null || true)"
if [ -z "${PID:-}" ]; then
  echo "Pidfile empty: $PIDFILE"
  rm -f "$PIDFILE"
  exit 1
fi

if kill "$PID" 2>/dev/null; then
  echo "Stopped server (PID $PID)"
else
  echo "Server not running (PID $PID)"
fi

rm -f "$PIDFILE"
