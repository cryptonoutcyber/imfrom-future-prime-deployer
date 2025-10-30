#!/bin/bash
# Trigger GeneNout GitHub Action via gh CLI or manual instructions

if command -v gh &> /dev/null; then
    echo "🚀 Triggering GeneNout workflow via GitHub CLI..."
    gh workflow run genenout-deploy.yml
    echo "✅ Workflow triggered! Check status: gh run list"
else
    echo "📋 GitHub CLI not found. Manual trigger instructions:"
    echo ""
    echo "1. Go to: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/actions"
    echo "2. Click: 'GeneNout v2.0 - Autonomous Deploy'"
    echo "3. Click: 'Run workflow' → 'Run workflow'"
    echo ""
    echo "Or install GitHub CLI: https://cli.github.com/"
fi
