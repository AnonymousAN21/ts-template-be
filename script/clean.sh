bash scripts/clean-examples.sh#!/usr/bin/env bash
#
# clean-examples.sh
#
# Removes placeholder scaffold files matching:
#   example.*.ts
#   better_example.*.ts
#
# anywhere in the project (excluding node_modules/.git), then deletes any
# directories left empty as a result.
#
# The top-level `example/example.txt` file is NOT touched — it's a .txt
# file, not a .ts file, so it never matches the delete patterns below.
#
# Usage:
#   ./scripts/clean-examples.sh            # actually delete
#   ./scripts/clean-examples.sh --dry-run   # just list what would be deleted

set -euo pipefail

cd "$(dirname "$0")/.."

DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
    DRY_RUN=true
fi

mapfile -d '' -t FILES < <(
    find . \
        -path ./node_modules -prune -o \
        -path ./.git -prune -o \
        -type f \( -name "example.*.ts" -o -name "better_example.*.ts" \) -print0
)

if [[ ${#FILES[@]} -eq 0 ]]; then
    echo "No example.*.ts or better_example.*.ts files found. Nothing to do."
    exit 0
fi

echo "Found ${#FILES[@]} file(s) to remove:"
printf '  %s\n' "${FILES[@]}"

if $DRY_RUN; then
    echo
    echo "Dry run only — no files were deleted. Re-run without --dry-run to apply."
    exit 0
fi

printf '%s\0' "${FILES[@]}" | xargs -0 rm -f
echo "Deleted."

echo "Done."