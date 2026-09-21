#!/usr/bin/env python3
"""把 modules/*.plugin 同步成两份清单，避免在 Loon 里手输插件 URL。

  1. auto.conf  [Plugin] 段   —— Loon 更新配置时自动加载/更新这些插件
  2. README.md  一键安装表     —— 手机点一下即可安装（loon:// 的 https 等价形式）

新增插件流程：
  1. 往 modules/ 放一个 .plugin 文件
  2. 运行 python3 tools/sync-plugins.py

两份清单都由本脚本写入标记之间，重复运行结果一致（幂等）。
"""

from __future__ import annotations

import re
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent.parent
MODULES = ROOT / "modules"
RAW_BASE = "https://raw.githubusercontent.com/ajune0527/proxy-script/refs/heads/main/modules"
IMPORT_BASE = "https://www.nsloon.com/openloon/import?plugin="

CONF = ROOT / "auto.conf"
README = ROOT / "README.md"
CONF_MARKERS = ("# >>> 本地插件清单", "# <<< 本地插件清单")
README_MARKERS = ("<!-- plugins:start -->", "<!-- plugins:end -->")


def meta(path: Path, key: str) -> str:
    """取插件头部的 `#!key = value`，兼容 `#!key = value` 与 `#!key= value`。"""
    match = re.search(rf"^#!\s*{re.escape(key)}\s*=\s*(.*)$", path.read_text(encoding="utf-8"), re.M)
    return match.group(1).strip() if match else ""


def raw_url(path: Path) -> str:
    return f"{RAW_BASE}/{path.name}"


def replace_block(path: Path, start: str, end: str, body: str) -> None:
    text = path.read_text(encoding="utf-8")
    try:
        head_end = text.index(start) + len(start)
        tail_start = text.index(end)
    except ValueError:
        raise SystemExit(f"{path.relative_to(ROOT)} 缺少标记：{start} / {end}")
    if tail_start < head_end:
        raise SystemExit(f"{path.relative_to(ROOT)} 标记顺序颠倒：{start} / {end}")
    path.write_text(f"{text[:head_end]}\n{body}{text[tail_start:]}", encoding="utf-8")


def main() -> None:
    plugins = sorted(MODULES.glob("*.plugin"))
    if not plugins:
        raise SystemExit("modules/ 下没有 .plugin 文件")

    replace_block(
        CONF,
        *CONF_MARKERS,
        "".join(f"{raw_url(p)}, enabled=true\n" for p in plugins),
    )

    rows = [
        "| 插件 | 说明 | 一键安装 |",
        "| --- | --- | --- |",
    ]
    for path in plugins:
        name = meta(path, "name") or path.name
        desc = meta(path, "desc") or "-"
        rows.append(f"| {name} | {desc} | [安装]({IMPORT_BASE}{quote(raw_url(path), safe='')}) |")
    replace_block(README, *README_MARKERS, "\n".join(rows) + "\n")

    print(f"已同步 {len(plugins)} 个插件：")
    for path in plugins:
        print(f"  {path.name}")


if __name__ == "__main__":
    main()