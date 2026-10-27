# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Personal page of Sergey Legkodymov, served by GitHub Pages at custom domain `legkodymov.name` (`CNAME`).

- No build tooling, Gemfile, or tests. GitHub Pages builds Jekyll on push to `master`.
- `_config.yml` sets theme `jekyll-theme-cayman` (GitHub Pages supported theme).
- `README.md` is the page content (rendered as index since no `index.md`/`index.html` exists).

## Local preview (optional)

Needs a Gemfile with `github-pages` gem (not in repo):

```
bundle exec jekyll serve
```

## Notes

- Don't modify `CNAME` unless changing the domain.
