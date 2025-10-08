#!/bin/bash
# Safe updater: import V0 export into obr-website while preserving custom work.
# Adds: correct backup/restore, optional --delete, dry-run, safe PDF renames, git tag/branch.

set -euo pipefail

# ===== Paths =====
REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
V0_EXPORT_DIR="$REPO_DIR/../v0-Export"
BACKUP_DIR="$REPO_DIR/../backups"
PDF_SOURCE_DIR="$REPO_DIR/../pdfs"
PDF_TARGET_DIR="$REPO_DIR/public/files"

# ===== Flags =====
DELETE_MODE="${DELETE_MODE:-0}"   # set to 1 to allow rsync --delete
DRY_RUN="${DRY_RUN:-0}"           # set to 1 for rsync --dry-run (no changes)

# ===== Pre-flight =====
if ! git -C "$REPO_DIR" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "❌ $REPO_DIR is not a Git repo. Re-clone, then re-run."
  echo "   cd ~/OBR-Site && rm -rf obr-website && git clone git@github.com:OB-Rye/obr-website.git"
  exit 1
fi
if [ ! -d "$V0_EXPORT_DIR" ]; then
  echo "❌ V0 export folder not found at $V0_EXPORT_DIR"
  exit 1
fi

mkdir -p "$BACKUP_DIR" "$PDF_TARGET_DIR"

timestamp() { date +"%Y%m%d-%H%M%S"; }

restore_latest() {
  local latest
  latest=$(ls -dt "$BACKUP_DIR"/obr-website-* 2>/dev/null | head -1 || true)
  [ -z "$latest" ] && echo "❌ No backups found in $BACKUP_DIR" && exit 1
  echo "⏪ Restoring from $latest"
  rsync -avh --delete "$latest/." "$REPO_DIR/"
  echo "✅ Restore complete."
}

restore_specific() {
  local path="$BACKUP_DIR/$1"
  [ ! -d "$path" ] && echo "❌ Backup $path not found." && exit 1
  echo "⏪ Restoring from $path"
  rsync -avh --delete "$path/." "$REPO_DIR/"
  echo "✅ Restore complete."
}

sync_pdfs() {
  if [ -d "$PDF_SOURCE_DIR" ]; then
    echo "📄 Syncing PDFs $PDF_SOURCE_DIR -> $PDF_TARGET_DIR"
    rsync -avh --delete "$PDF_SOURCE_DIR/" "$PDF_TARGET_DIR/"
    # Rename spaces/apostrophes safely instead of deleting
    find "$PDF_TARGET_DIR" -type f \( -name "* *" -o -name "*'*" \) | while read -r f; do
      dir=$(dirname "$f")
      base=$(basename "$f")
      new=$(echo "$base" | tr " ':" "__-")
      if [ "$base" != "$new" ]; then
        echo "🧹 Renaming: $base -> $new"
        mv "$f" "$dir/$new"
      fi
    done
    echo "✅ PDFs updated."
  else
    echo "ℹ️ PDF source $PDF_SOURCE_DIR not found. Skipping PDF sync."
  fi
}

update_repo() {
  cd "$REPO_DIR"

  # 0) Create safety tag & branch
  local ts branch tag
  ts=$(timestamp)
  branch="v0-import-$ts"
  tag="pre-v0-import-$ts"
  git tag -a "$tag" -m "Snapshot before V0 import ($ts)" || true
  git checkout -b "$branch"

  # 1) Backup current repo CONTENTS (not a nested folder)
  local backup_path="$BACKUP_DIR/obr-website-$ts"
  mkdir -p "$backup_path"
  rsync -aH --delete "$REPO_DIR/." "$backup_path/"
  echo "📦 Backup created at $backup_path"

  # 2) Build rsync args
  RSYNC_ARGS=(-avh)
  [ "$DRY_RUN" = "1" ] && RSYNC_ARGS+=("--dry-run")
  [ "$DELETE_MODE" = "1" ] && RSYNC_ARGS+=("--delete")

  echo "🔁 Syncing V0 export -> repo (preserve critical custom files)"
  rsync "${RSYNC_ARGS[@]}" \
    --exclude '.git/' \
    --exclude '.gitignore' \
    --exclude 'app/contact/page.tsx' \
    --exclude 'app/api/contact/route.ts' \
    --exclude 'app/layout.tsx' \
    --exclude 'styles/obr-overrides.css' \
    --exclude 'components/OBRContactForm.tsx' \
    --exclude 'components/V0ContactClient.tsx' \
    --exclude 'public/files/' \
    "$V0_EXPORT_DIR/" "$REPO_DIR/"

  echo "✅ V0 export copied."

  # 2.5) Remove V0 demo route if present
  if [ -d "$REPO_DIR/app/api/send-email" ]; then
    echo "🧹 Removing V0-generated /app/api/send-email"
    rm -rf "$REPO_DIR/app/api/send-email"
  fi

  # 2.6) Force npm on Vercel (avoid pnpm/yarn lockfiles)
  rm -f "$REPO_DIR/pnpm-lock.yaml" "$REPO_DIR/yarn.lock"

  # 3) Sync PDFs into public/files
  sync_pdfs

  # 4) Show diff (even on dry-run this is useful)
  git add -A
  git add public/files/*.pdf 2>/dev/null || true
  echo "🔎 Git changes preview:"
  git status
  git --no-pager diff --staged --stat

  if [ "$DRY_RUN" = "1" ]; then
    echo "🧪 Dry-run complete. No commits made. Re-run without DRY_RUN=1 to apply."
    return
  fi

  git commit -m "Import new V0 export (preserve layout/fonts/overrides/forms/backend/.gitignore; remove V0 send-email; force npm; update PDFs)" || echo "ℹ️ Nothing new to commit."
  echo "✅ Changes committed on branch: $branch"
  echo "➡️ Push with: git push -u origin $branch"
  echo "ℹ️ Tag for rollback: $tag  (restore with: git reset --hard $tag)"
}

case "${1:-}" in
  --restore)
    [ -z "${2:-}" ] || [ "$2" = "latest" ] && restore_latest || restore_specific "$2"
    ;;
  *)
    update_repo
    ;;
esac
