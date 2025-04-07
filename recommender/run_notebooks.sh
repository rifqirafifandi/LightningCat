#!/usr/bin/env bash

set -Eeuo pipefail
trap - SIGINT SIGTERM ERR EXIT

jupyter lab  --autoreload
