#!/bin/bash
# Update obr-website with new V0 export, while preserving:
# - .git (repo metadata)
# - .gitignore (custom ignore rules)
# - app/contact/page.tsx (custom wrapper that imports V0ContactClient)
# - app/api/contact/route.ts (SendGrid backend)
# - app/layout.tsx (custom Geist fonts + overrides import)
# - styles/obr-overrides.css (custom design overrides)
# - components/OBRContactForm.tsx (safe legacy form component)
# - components/V0ContactClient.tsx (new v0 form client)
# - public/files/ (synced from ../pdfs/)
# Also: removes V0 demo route (/app/api/send-email), forces npm (no pnpm/yarn),
# creates a timestamped backup, and supports restore.

set -e

# ===== Paths (relative to repo root) =====
REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
V0_EXPORT_DIR="$REPO_DIR/../v0-Export"
BACKUP_DIR="$REPO_DIR/../backups"
PDF_SOURCE_DIR="$REPO_DIR/../pdfs"
PDF_TARGET_DIR="$REPO_DIR/public/files"

# ===== Pre-flight checks =====
if [ ! -d "$REPO_DIR/.git" ]; then
  echo "❌ $REPO_DIR is not a Git repo (missing .git). Re-clone the repo, then re-run."
  echo "   cd ~/OBR-Site && rm -rf obr-website && git clone git@github.com:OB-Rye/obr-website.git"
  exit 1
fi

if [ ! -d "$V0_EXPORT_DIR" ]; then
  echo "❌ V0 export folder not found at $V0_EXPORT_DIR"
  exit 1
fi

# ===== Ensure dirs exist =====
mkdir -p "$BACKUP_DIR" "$PDF_TARGET_DIR"

# ===== Helpers =====
timestamp() { date +"%Y%m%d-%H%M%S"; }

restore_latest() {
  local latest
  latest=$(ls -dt "$BACKUP_DIR"/obr-website-* 2>/dev/null | head -1)
  [ -z "$latest" ] && echo "❌ No backups found in $BACKUP_DIR" && exit 1
  echo "⏪ Restoring from $latest"
  rsync -avh --delete "$latest/" "$REPO_DIR/"
  echo "✅ Restore complete."
}

restore_specific() {
  local path="$BACKUP_DIR/$1"
  [ ! -d "$path" ] && echo "❌ Backup $path not found." && exit 1
  echo "⏪ Restoring from $path"
  rsync -avh --delete "$path/" "$REPO_DIR/"
  echo "✅ Restore complete."
}

sync_pdfs() {
  if [ -d "$PDF_SOURCE_DIR" ]; then
    echo "📄 Syncing PDFs $PDF_SOURCE_DIR -> $PDF_TARGET_DIR"
    rsync -avh --delete "$PDF_SOURCE_DIR/" "$PDF_TARGET_DIR/"
    # Clean filenames with spaces/apostrophes
    echo "🧹 Cleaning PDFs with spaces/apostrophes in $PDF_TARGET_DIR"
    find "$PDF_TARGET_DIR" -type f \( -name "* *" -o -name "*'*" \) -print -delete || true
    echo "✅ PDFs updated."
  else
    echo "ℹ️ PDF source $PDF_SOURCE_DIR not found. Skipping PDF sync."
  fi
}

update_repo() {
  # 1) Backup current repo
  local ts backup_path
  ts=$(timestamp)
  backup_path="$BACKUP_DIR/obr-website-$ts"
  cp -R "$REPO_DIR" "$backup_path"
  echo "📦 Backup created at $backup_path"

  # 2) Bring in V0 export while preserving .git, custom files, and public/files
  echo "🔁 Syncing V0 export -> repo (preserve .git, .gitignore, overrides, fonts, forms, backend & PDFs)"
  rsync -avh --delete \
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

  # 4) Commit changes
  cd "$REPO_DIR"
  git add -A
  git add public/files/*.pdf 2>/dev/null || true
  git commit -m "Import new V0 export (preserve layout/fonts/overrides/forms/backend/.gitignore; remove V0 send-email; force npm; update PDFs)" || echo "ℹ️ Nothing new to commit."
  echo "✅ Changes staged and committed (if any)."
  echo "➡️ Push with: git push origin main"
}

# ===== Entry point =====
case "$1" in
  --restore)
    [ -z "$2" ] || [ "$2" = "latest" ] && restore_latest || restore_specific "$2"
    ;;
  *)
    update_repo
    ;;
esac
