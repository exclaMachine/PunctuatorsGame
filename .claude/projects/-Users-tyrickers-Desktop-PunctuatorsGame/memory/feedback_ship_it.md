---
name: ship it trigger
description: Only run git add/commit/push when user explicitly says "ship it" — not after every code change
type: feedback
---

Only commit and push when the user says the exact phrase "ship it". Do not ship automatically after completing a code change, even if the change seems complete.

**Why:** User was surprised when I shipped after a code change they hadn't approved yet. They want control over when code goes to the remote.

**How to apply:** After making code changes, stop and wait. Only run `git add . && git commit && git push` when the user explicitly says "ship it".
