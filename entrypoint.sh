#!/bin/bash

# Exit on error
set -e

# Check if the arguments contain "-a" and get the model name
model_name="gemma2:2b"
model_required=false
for arg in "$@"; do
    if [[ "$arg" == "-a" || "$arg" == "--ai" ]]; then
        model_required=true
    elif [[ "$arg" == "-m" || "$arg" == "--ai-model" ]]; then
        model_name="$2"
    fi
    shift
done

# Start Ollama and download the model
if $model_required; then
    # Start Ollama in the background
    ollama serve &

    # Wait for Ollama to be ready
    until curl -s http://localhost:11434/api/tags > /dev/null; do
        echo "Waiting for Ollama to start..."
        sleep 2
    done

    # Download the model
    ollama pull "$model_name"
fi

# Run mscraper with any provided arguments
set -- "$@"
exec mscraper "$@"
