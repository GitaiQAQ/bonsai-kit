# Changesets

This folder contains changeset entries — one Markdown file per change. Each PR should add a changeset describing what changed.

```bash
npx changeset           # creates a new entry interactively
```

When merged to `main`, the Release workflow opens a "Version Packages" PR that aggregates all pending changesets, bumps the version, and updates `CHANGELOG.md`. Merging that PR triggers a publish to npm.
