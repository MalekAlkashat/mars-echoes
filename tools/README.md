# Local asset recovery

If Mars fails to load on macOS and assets report `compressed,dataless`, iCloud has left file placeholders in the checkout. From this repository run:

```sh
python3 tools/restore_game_placeholders.py
```

The tool restores only tracked placeholder files under `game/src`, `game/public` and `game/tests`, using this repository’s current commit on GitHub. It checks every download against the index’s Git blob hash before atomically replacing the placeholder. Hydrated, edited and untracked files are preserved; a staged file differing from the current commit fails hash verification. It requires network access to the public repository. Reload the browser afterward. Keep the project downloaded locally to avoid recurrence.
