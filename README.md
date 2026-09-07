# Pi Evidence Debug

[简体中文](README.zh-CN.md)

An evidence-first debugging extension for [Pi](https://github.com/badlogic/pi-mono). It helps a coding agent reproduce real failures, identify root causes, apply minimal fixes, and verify results—without speculative edits when evidence is insufficient.

> This is an independent community project. It is not affiliated with or endorsed by Pi.

## Install

Clone this repository anywhere on your machine. End users do not need to install this repository's Node dependencies.

```bash
git clone <repository-url> pi-evidence-debug
cd /path/to/repository-to-debug
pi -e /absolute/path/to/pi-evidence-debug/index.ts
```

Pi starts normally with the extension loaded. In the Pi prompt, run:

```text
/debug Find the incorrect behavior, fix it, and verify it.
```

`/debug` is interactive. Do not use it as an injected command in Pi `--print` mode because Pi can dispose the session before the asynchronous follow-up message starts.

## Configure a model

Pi owns provider and model selection; this extension does not call model APIs or store credentials. For a generic OpenAI-compatible Pi configuration, set `OPENAI_API_KEY` in your shell and use:

```bash
export OPENAI_BASE_URL="https://api.openai.com/v1"
pi --provider openai --model <model-id> -e /absolute/path/to/pi-evidence-debug/index.ts
```

Choose any Pi-supported provider and model that fit your environment. Never commit credential values to a repository.

## Evidence policy

Before editing, the agent must reproduce a failing test, observe incorrect runtime output, or identify a contradiction with an explicit requirement. If relevant checks pass and no direct evidence exists, it must leave source files unchanged, report that no confirmed defect was found, and list possible risks only in `Remaining risk`.

The extension records a failed recognized verification command—such as `pytest`, `go test`, or `npm test`—as `verification-failed` in the Pi session and displays that a failure was reproduced in the TUI status. An arbitrary nonzero shell command is not automatically treated as defect evidence.

New validation, API changes, or behavior justified only by hypothetical hidden tests are out of scope unless an explicit requirement exists. When an explicit requirement needs new behavior, the agent must first add a regression test that fails before changing production code.

## Safety limits

The extension blocks `write` and `edit` calls outside Pi's current working directory. It classifies recursive deletion, privilege elevation, destructive Git reset/clean/checkout commands, broad permission changes, and `mkfs` as dangerous. In an interactive session, Pi asks for confirmation; in a headless session, the extension blocks those commands.

This is not an operating-system sandbox. Commands still run with the permissions of the Pi process. Use an isolated clone for demonstrations and review all model changes.

## Manual acceptance test

The included fixture starts with a known failing test:

```bash
cd examples/python-pagination-bug
python3 -m unittest -v
```

Start Pi in that directory, load `/absolute/path/to/pi-evidence-debug/index.ts`, then run `/debug`. Independently rerun `python3 -m unittest -v` after the agent settles. A correct repair changes the final-page count from five items to one item.

To test the no-speculation policy, run `/debug` in a repository whose relevant tests already pass. The expected result is a report with no source changes and a clear `Remaining risk` section.

## Contributing

Install contributor dependencies and run the checks:

```bash
npm install --legacy-peer-deps
npm run check
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the development workflow and [SECURITY.md](SECURITY.md) for private vulnerability reporting.

## License

[MIT](LICENSE)
