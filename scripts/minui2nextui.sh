#!/bin/bash
set -e

# Get path from argument or use current directory
TARGET_PATH="${1:-.}"

echo "Looking for .res folders in: $TARGET_PATH"

# Find all .res directories and rename them to .media
find "$TARGET_PATH" -type d -name ".res" | while read -r dir; do
  new_dir="${dir%.res}.media"
  echo "Renaming: $dir → $new_dir"
  mv "$dir" "$new_dir"
done

echo "Finished renaming folders"
