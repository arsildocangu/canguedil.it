#!/usr/bin/env sh
set -eu

PORT="${1:-4173}"
BIND="${BIND:-localhost}"
DIR="${DIR:-docs}"
PIDFILE="${PIDFILE:-.serve.pid}"
LOGFILE="${LOGFILE:-.serve.log}"
HEALTH_HOST="${HEALTH_HOST:-$BIND}"
MAX_RETRIES="${MAX_RETRIES:-40}"

if ! command -v python3 >/dev/null 2>&1; then
  echo "Error: python3 not found in PATH"
  exit 1
fi

if [ ! -d "$DIR" ]; then
  echo "Error: directory not found: $DIR"
  exit 1
fi

if [ -f "$PIDFILE" ]; then
  PID="$(cat "$PIDFILE" 2>/dev/null || true)"
  if [ -n "${PID:-}" ] && kill -0 "$PID" 2>/dev/null; then
    echo "Server already running (PID $PID): http://$BIND:$PORT"
    exit 0
  fi
  rm -f "$PIDFILE"
fi

nohup python3 -m http.server "$PORT" --bind "$BIND" --directory "$DIR" >"$LOGFILE" 2>&1 &
PID="$!"
printf "%s" "$PID" >"$PIDFILE"

RETRY=0
while [ "$RETRY" -lt "$MAX_RETRIES" ]; do
  if ! kill -0 "$PID" 2>/dev/null; then
    echo "Server exited early. Logs: $LOGFILE"
    if [ -s "$LOGFILE" ]; then
      tail -n 20 "$LOGFILE"
    fi
    rm -f "$PIDFILE"
    exit 1
  fi

  if curl -fsS "http://$HEALTH_HOST:$PORT" >/dev/null 2>&1; then
    echo "Started server (PID $PID): http://$HEALTH_HOST:$PORT"
    echo "Logs: $LOGFILE"
    exit 0
  fi

  RETRY=$((RETRY + 1))
  sleep 0.1
done

echo "Server process is running (PID $PID) but health check did not pass."
echo "Try: http://$HEALTH_HOST:$PORT"
echo "Logs: $LOGFILE"
