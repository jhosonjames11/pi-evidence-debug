# Pi Evidence Debug

[English](README.md)

一个面向 [Pi](https://github.com/badlogic/pi-mono) 的证据优先调试扩展。它帮助 coding agent 复现真实失败、定位根因、做最小修复并验证结果；当证据不足时，不会进行猜测性修改。

> 这是独立的社区项目，与 Pi 官方没有隶属、合作或背书关系。

## 安装

将仓库克隆到本机任意位置。普通使用者不需要为本仓库安装 Node 依赖。

```bash
git clone <repository-url> pi-evidence-debug
cd /path/to/repository-to-debug
pi -e /absolute/path/to/pi-evidence-debug/index.ts
```

Pi 启动后会加载扩展。在 Pi 提示符中输入：

```text
/debug Find the incorrect behavior, fix it, and verify it.
```

`/debug` 是交互式命令。不要在 Pi 的 `--print` 模式中把它作为注入命令，因为 Pi 可能在异步后续消息开始前释放会话。

## 配置模型

Provider 和模型由 Pi 负责选择；本扩展不会直接请求模型 API，也不会保存凭据。使用通用 OpenAI 兼容配置时，请先在 shell 中设置 `OPENAI_API_KEY`，再执行：

```bash
export OPENAI_BASE_URL="https://api.openai.com/v1"
pi --provider openai --model <model-id> -e /absolute/path/to/pi-evidence-debug/index.ts
```

你可以选择环境中 Pi 支持的任意 provider 和模型。绝不要把凭据值提交到仓库。

## 证据策略

修改代码前，agent 必须复现失败测试、观察到错误运行结果，或发现与明确需求冲突的行为。若相关检查均通过且没有直接证据，它必须保持源码不变，明确报告“未发现已证实的缺陷”，并只在 `Remaining risk` 中记录潜在风险。

扩展会将失败的已识别验证命令（例如 `pytest`、`go test`、`npm test`）记录为 Pi session 中的 `verification-failed`，并在 TUI 状态中显示已复现失败。任意 shell 命令的非零退出不会自动被当作缺陷证据。

仅凭“可能有隐藏测试”不能新增校验、改变 API 或添加行为。确有明确需求时，agent 必须先添加修改前会失败的回归测试，再改生产代码。

## 安全边界

扩展会阻止 `write` 和 `edit` 操作越出 Pi 当前工作目录；递归删除、权限提升、破坏性的 Git reset/clean/checkout、广泛权限修改与 `mkfs` 会被识别为危险命令。交互会话中 Pi 会请求确认；无界面会话中扩展会阻止这些命令。

这不是操作系统沙箱。命令仍以 Pi 进程的权限运行。请在隔离 clone 中演示，并审查模型生成的每一处修改。

## 手工验收测试

仓库包含一个已知会失败的 fixture：

```bash
cd examples/python-pagination-bug
python3 -m unittest -v
```

先确认失败，然后在该目录启动 Pi、加载 `/absolute/path/to/pi-evidence-debug/index.ts`，再执行 `/debug`。agent 结束后独立运行同一条 `python3 -m unittest -v`。正确修复会把末页的五条数据改为一条数据。

若要测试“不猜测修改”策略，请在相关测试已通过的仓库中执行 `/debug`。预期结果应是不修改源码，并在 `Remaining risk` 中清楚说明风险。

## 贡献

安装贡献者依赖并运行检查：

```bash
npm install --legacy-peer-deps
npm run check
```

开发流程见 [CONTRIBUTING.md](CONTRIBUTING.md)，私密漏洞报告方式见 [SECURITY.md](SECURITY.md)。

## 许可证

[MIT](LICENSE)
