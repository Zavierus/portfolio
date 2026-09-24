# -*- coding: utf-8 -*-
"""
ZIAVER 简历与网页自动化同步脚本
功能：
1. 自动寻找桌面或投递包中最新的简历 PDF 文件；
2. 校验并修复 PDF 中指向作品集在线地址的超链接（确保点击可正常打开 soft-salad-ff03.939431931.workers.dev）；
3. 自动同步覆盖到 portfolio/assets/resume/王泽源_Ziaver_个人主简历.pdf；
4. 自动同步覆盖到 resume/王泽源_ZIAVER_简历.pdf。
"""

import os
import glob
import shutil

try:
    import fitz
except ImportError:
    fitz = None

PORTFOLIO_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PACKAGE_DIR = os.path.dirname(PORTFOLIO_DIR)
DESKTOP_DIR = os.path.join(os.path.expanduser("~"), "Desktop")

TARGET_ONLINE_URL = "https://soft-salad-ff03.939431931.workers.dev"
RESUME_ASSET_PATH = os.path.join(PORTFOLIO_DIR, "assets", "resume", "王泽源_Ziaver_个人主简历.pdf")
RESUME_PACKAGE_PATH = os.path.join(PACKAGE_DIR, "resume", "王泽源_ZIAVER_简历.pdf")

def find_latest_resume():
    # 候选位置
    candidates = []
    # 1. 桌面上的简历
    for p in glob.glob(os.path.join(DESKTOP_DIR, "*简历*.pdf")):
        if "展示" not in p and "长图" not in p:
            candidates.append(p)
    # 2. 投递包内部的简历
    for p in glob.glob(os.path.join(PACKAGE_DIR, "resume", "*.pdf")):
        if "master" not in p and "展示" not in p:
            candidates.append(p)

    if not candidates:
        return None

    # 按修改时间最新排序
    candidates.sort(key=lambda x: os.path.getmtime(x), reverse=True)
    return candidates[0]

def fix_and_sync():
    latest = find_latest_resume()
    if not latest:
        print("[!] 未在桌面或投递包中找到简历 PDF 文件。")
        return False

    print(f"[*] 找到最新简历文件: {latest}")

    # 如果有 fitz，修复内部点击链接
    if fitz:
        try:
            doc = fitz.open(latest)
            fixed_count = 0
            for i, page in enumerate(doc):
                for link in page.get_links():
                    uri = link.get("uri", "")
                    if "vercel.app" in uri:
                        link["uri"] = TARGET_ONLINE_URL
                        page.update_link(link)
                        fixed_count += 1
            
            os.makedirs(os.path.dirname(RESUME_ASSET_PATH), exist_ok=True)
            doc.save(RESUME_ASSET_PATH, garbage=3, deflate=True)
            doc.close()
            print(f"[+] 已同步到网页下载目录: {RESUME_ASSET_PATH} (修正了 {fixed_count} 个超链接)")
        except Exception as e:
            print(f"[!] PyMuPDF 优化失败，降级为直接复制: {e}")
            shutil.copy2(latest, RESUME_ASSET_PATH)
            print(f"[+] 已直接覆盖到网页下载目录: {RESUME_ASSET_PATH}")
    else:
        shutil.copy2(latest, RESUME_ASSET_PATH)
        print(f"[+] 已直接覆盖到网页下载目录: {RESUME_ASSET_PATH}")

    # 同步覆盖投递包简历
    try:
        shutil.copy2(RESUME_ASSET_PATH, RESUME_PACKAGE_PATH)
        print(f"[+] 已同步到投递包根目录: {RESUME_PACKAGE_PATH}")
    except Exception as e:
        print(f"[!] 复制到投递包失败: {e}")

    return True

if __name__ == "__main__":
    fix_and_sync()
