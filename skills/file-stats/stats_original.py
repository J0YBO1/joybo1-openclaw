import argparse
import os
from pathlib import Path


def get_file_stats(filepath):
    if not os.path.exists(filepath):
        print("文件不存在！")
        return None
    with open(filepath, 'r',encoding = 'utf-8') as f:
        content = f.read()
    lines = content.splitlines()
    words = content.split()
    return {"lines":len(lines),"words":len(words),"chars":len(content)}


parser = argparse.ArgumentParser(description="统计文件的行数、单词数和字符数")
parser.add_argument('--path',required = True,help='要统计的文件路径')
parser.add_argument('--format',choices=['text','json'],default='text',help='输出格式')
args = parser.parse_args()

result = get_file_stats(args.path)

if args.format =='json':
    import json
    print(json.dumps(result,ensure_ascii=False,indent=2))
else:
    if result is None:
        print(f"文件不存在:{args.path}")
    else:
        print(f"行数: {result['lines']}")
        print(f"单词数: {result['words']}")
        print(f"字符数: {result['chars']}")