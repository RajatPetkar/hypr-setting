# Contributing to Hypr Settings

Thanks for your interest in contributing — contributions, issues, and PRs are welcome.

Getting started

- Fork the repository on GitHub.
- Clone your fork locally and install dependencies:

```bash
git clone git@github.com:youruser/hypr-settings.git
cd hypr-settings
npm install
```

Running the app for development

```bash
npm run tauri:dev
```

Code style

- Follow the existing TypeScript and Rust project conventions.
- Run `npm run lint` (type-check) before opening a PR.

Pull requests

- Create a feature branch from `main`.
- Make small, focused changes and include tests or manual verification steps.
- Open a PR describing the change and link any related issues.

Releases & artifacts

- Releases are built by GitHub Actions when a tag is pushed (see `.github/workflows/release.yml`).

Communication

- For questions, open an issue and tag it appropriately.
