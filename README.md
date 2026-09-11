# Manfred project journal

Independent website repository: https://github.com/luka-w/manfred-log
The robot's public name is Manfred; Walker remains its internal project name.
Only `dist/` is deployed to GitHub Pages. No robot source, checkpoints or raw logs belong here.

## Preview

From this repository, using Python 3:

```bash
python3 scripts/check.py
python3 -m http.server 8000 --bind 127.0.0.1 --directory dist
```

Open http://127.0.0.1:8000. Stop with Ctrl+C.

## Posts and videos

Edit `dist/content.json`. Posts are short, in English (usually 40–70 words
+ one next-step sentence), explicitly labelled `AI-written`, and written in
the third person. Never impersonate the project owner. Distinguish simulation
results from hardware validation; acceptance belongs to the owner.

Add approved MP4 clips to `dist/media/`, with short English captions in each
post's `videos` list (`src` and `caption`). Keep each asset below 20 MB.
Drafts in `drafts/` are not published or tracked.

Generate first-frame posters with Python containing `imageio-ffmpeg`
(available in the adjacent Walker environment):

```bash
../env/bin/python scripts/make_posters.py
../env/bin/python scripts/check.py
```

Each poster is a JPG with the same basename as its MP4. Commit both files.
The generator does not modify videos.

## Publish

In GitHub repository settings, select **Pages → Source → GitHub Actions**.
Pushes to `main` run `.github/workflows/pages.yml`, validate the public files
and deploy `dist/`. The workflow can also be started manually from Actions.
The expected URL after successful deployment is https://luka-w.github.io/manfred-log/.

Review all staged files before publishing. Assistant commits and pushes require
explicit permission and apply only to this website repository, not the robot repository.
