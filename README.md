# Manfred

A humanoid robot in development. This journal follows its progress through
short updates, simulation videos and, as the build progresses, hardware tests.

**[Read the project journal →](https://luka-w.github.io/manfred-log/)**

The project uses Autodesk Fusion for mechanical design, ACDC4Robot for model
export, and MuJoCo/MJX with a ToddlerBot-based learning stack for simulation
and control experiments.

Posts are AI-written summaries of project work, reviewed by the project owner.
Simulation results are not evidence of hardware readiness.

## About this repository

This repository contains the journal website and selected media, not the
robot's CAD files or training code. The site is plain HTML, CSS and JavaScript,
hosted on GitHub Pages.

To preview it locally with Python 3:

```bash
python3 -m http.server 8000 --bind 127.0.0.1 --directory dist
```

Open [localhost:8000](http://localhost:8000).
