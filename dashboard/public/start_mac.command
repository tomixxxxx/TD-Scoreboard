#!/bin/bash
cd "$(dirname "$0")"

# サーバーが起動するまで少し待ってからブラウザを開く（バックグラウンドで実行）
(sleep 2 && open http://localhost:3000) &

# 簡易サーバーを起動
echo "Starting TD Scoreboard..."
echo "Press Ctrl+C to stop."
npx serve -s . -l 3000
