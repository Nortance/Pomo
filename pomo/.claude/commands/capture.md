---
description: Capture screenshot of localhost:3000 app
allowed-tools: Bash(npm run screenshot*)
---
Take a screenshot of the running dev server at localhost:3000.

Usage: /capture [name] [viewport]
- name: Optional filename (default: timestamp)
- viewport: desktop (default), mobile, or tablet

Examples:
- /capture → desktop screenshot with timestamp
- /capture timer → saves as timer.png
- /capture homepage mobile → mobile viewport

After capturing, read and analyze the screenshot from the screenshots/ folder.

$ARGUMENTS
