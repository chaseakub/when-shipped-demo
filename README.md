# Which Marked release fixed the missing blank line?

This repository runs the public [Tell me when this ships Action](https://github.com/chaseakub/tell-me-when-this-ships) on a real downstream issue. It tracks a formatting bug fixed by [Marked PR #4200](https://github.com/markedjs/marked/pull/4200).

A fenced code block with one empty line loses that line in `marked@18.2.0`. Version `18.2.1` preserves it. To reproduce the behavior of both published packages, run:

```sh
npm ci --ignore-scripts
npm test
```

The public [tracker issue](https://github.com/chaseakub/when-shipped-demo/issues/1) replays the two published versions in order. At registration the Action checks 18.2.0. A maintainer then dispatches the same workflow with 18.2.1. Both runs use the public npm registry and GitHub commit history. A separate [package test](https://github.com/chaseakub/when-shipped-demo/actions/workflows/proof.yml) checks the actual rendered HTML.

The [demo workflow](.github/workflows/when-shipped.yml) pins the older version for the first check so the replay is repeatable. The [normal installer](https://github.com/chaseakub/tell-me-when-this-ships/blob/main/examples/when-shipped.yml) follows npm's latest stable release on a schedule.
