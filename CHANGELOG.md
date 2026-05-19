# Changelog

## 0.0.12

### Patch Changes

- Restrict userscripts @match to ads.tiktok.com

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-05-13

### Added

- Initial release.
- Core components: `<bk-resizable-panel>`, `<bk-module-list>`, `<bk-vmok-inspector>`,
  `<bk-floating-button>`, `<bk-dock-bar>`, `<bk-setting-panel>`, `<bk-tabs-view>`,
  `<bk-toast-stack>`, `<bk-confirm-dialog>`.
- Imperative helpers: `toast()`, `confirm()`.
- Utilities: `LocalStore`, `GMStore`, `makeDraggable`, `VmokSource`.
- Internal authoring API: `BonsaiElement`, `html`, `define`, `withTokens`.
- Component generator script: `npm run new:component <name>`.
- Userscript template under `examples/userscript.user.js`.
