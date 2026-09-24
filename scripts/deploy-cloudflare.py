# -*- coding: utf-8 -*-
"""
ZIAVER 简历与在线网页一键极速同步至 Cloudflare
"""
import os
import sys
import glob
import shutil
import subprocess

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(errors="replace")

PORTFOLIO_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PACKAGE_DIR = os.path.dirname(PORTFOLIO_DIR)
DESKTOP_DIR = os.path.join(os.path.expanduser("~"), "Desktop")

TARGET_ONLINE_URL = "https://zeno0.com"
RESUME_ASSET_PATH = os.path.join(PORTFOLIO_DIR, "assets", "resume", "王泽源_Zeno_个人主简历.pdf")
RESUME_PACKAGE_PATH = os.path.join(PACKAGE_DIR, "resume", "王泽源_Zeno_简历.pdf")

try:
    import pymupdf as fitz
except ImportError:
    try:
        import fitz
    except ImportError:
        fitz = None

def print_banner():
    print("=" * 68)
    print("       ⚡ ZENO 简历与 Cloudflare 在线作品集一键极速同步")
    print("=" * 68)
    print()

def sync_resume():
    print("[步骤 1/3] 正在检测并同步本地最新简历文件...")
    
    candidates = []
    for p in glob.glob(os.path.join(DESKTOP_DIR, "*简历*.pdf")):
        if "展示" not in p and "长图" not in p:
            candidates.append(p)
    for p in glob.glob(os.path.join(PACKAGE_DIR, "resume", "*.pdf")):
        if "master" not in p and "展示" not in p:
            candidates.append(p)

    if not candidates:
        print("[!] 未在桌面或投递包找到新简历，跳过覆盖，使用现有资源。")
        return True

    candidates.sort(key=lambda x: os.path.getmtime(x), reverse=True)
    latest = candidates[0]
    print(f"[*] 命中最新简历文件: {os.path.basename(latest)}")

    # 修复内部超链接
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
            print(f"[+] 网页下载位已就绪 (已校准 {fixed_count} 处在线作品集跳转超链接)")
        except Exception as e:
            shutil.copy2(latest, RESUME_ASSET_PATH)
            print(f"[+] 网页下载位已更新: {os.path.basename(RESUME_ASSET_PATH)}")
    else:
        shutil.copy2(latest, RESUME_ASSET_PATH)
        print(f"[+] 网页下载位已更新: {os.path.basename(RESUME_ASSET_PATH)}")

    try:
        shutil.copy2(RESUME_ASSET_PATH, RESUME_PACKAGE_PATH)
    except Exception:
        pass

    # 同时同步到纯净的网页拖拽包
    web_deploy_dir = os.path.join(PACKAGE_DIR, "portfolio-web-deploy-网页拖拽专用包")
    if os.path.exists(web_deploy_dir):
        target_in_deploy = os.path.join(web_deploy_dir, "assets", "resume", "王泽源_Zeno_个人主简历.pdf")
        try:
            os.makedirs(os.path.dirname(target_in_deploy), exist_ok=True)
            shutil.copy2(RESUME_ASSET_PATH, target_in_deploy)
        except Exception:
            pass

    return True

def check_login():
    print("\n[步骤 2/3] 检查 Cloudflare 授权状态...")
    res = subprocess.run("npx wrangler whoami", shell=True, cwd=PORTFOLIO_DIR, capture_output=True)
    stdout_text = res.stdout.decode("utf-8", errors="replace")
    
    if "You are not authenticated" in stdout_text or res.returncode != 0:
        print("[*] 首次使用需要登录授权 Cloudflare 账号。")
        print("[*] 正在为你自动打开浏览器，请在弹出的网页点击「Allow (授权)」...")
        print()
        login_res = subprocess.run("npx wrangler login", shell=True, cwd=PORTFOLIO_DIR)
        if login_res.returncode != 0:
            print("\n[!] 登录未完成，请重试或使用网页拖拽方案。")
            return False
        print("[+] 登录授权成功！")
    else:
        print("[+] Cloudflare 授权校验通过！")
    return True

def deploy():
    print("\n[步骤 3/3] 正在增量同步最新简历与网页至 Cloudflare (soft-salad-ff03)...")
    res = subprocess.run("npx wrangler deploy", shell=True, cwd=PORTFOLIO_DIR)
    
    if res.returncode == 0:
        print()
        print("=" * 68)
        print(" 🎉 同步成功！最新简历已与在线作品集网页实时同步上线！")
        print()
        print(" 🌐 在线作品集地址:")
        print("    https://soft-salad-ff03.939431931.workers.dev")
        print("    https://zeno0.com (待绑定)")
        print()
        print(" 📥 网页简历直接下载测试:")
        print("    https://soft-salad-ff03.939431931.workers.dev/assets/resume/王泽源_Zeno_个人主简历.pdf")
        print("=" * 68)
        return True
    else:
        print("\n[!] 同步遇到网络异常。如果网络不畅，你也可以把「portfolio-web-deploy-网页拖拽专用包」直接拖入 Cloudflare 网页端上传。")
        return False

def main():
    print_banner()
    if not sync_resume():
        return
    if not check_login():
        return
    deploy()
    if sys.stdin and sys.stdin.isatty():
        input("\n按回车键退出...")

if __name__ == "__main__":
    main()
