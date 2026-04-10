---
name: file-stats
description: 统计文件的行数、单词数、字符数
---

## When to use
当用户说"统计文件"、"统计这个文件"、"文件有多少行"时使用

## Workflow
1. 用户提供文件路径
2. 执行 python stats.py --path "文件路径" --format text
3. 返回统计结果