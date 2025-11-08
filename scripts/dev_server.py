#!/usr/bin/env python3
"""
開発用サーバー: 静的ファイル配信 + API機能
営業事務の人がブラウザからサービスページを編集できるようにする
"""

import json
import os
import subprocess
import sys
from pathlib import Path
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import threading

# プロジェクトのルートディレクトリ
ROOT = Path(__file__).parent.parent
SRC = ROOT / "src"
PUBLIC = ROOT / "public"
DATA_DIR = SRC / "data"
SERVICE_ITEMS_JSON = DATA_DIR / "service_items.json"
BUILD_SCRIPT = ROOT / "scripts" / "build.py"

PORT = 5173


class DevServerHandler(SimpleHTTPRequestHandler):
    """開発用サーバーハンドラー: 静的ファイル配信 + API機能"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(PUBLIC), **kwargs)
    
    def do_GET(self):
        """GETリクエスト: 静的ファイル配信またはAPI"""
        if self.path.startswith('/api/'):
            self.handle_api_get()
        else:
            # 通常の静的ファイル配信
            super().do_GET()
    
    def do_POST(self):
        """POSTリクエスト: API処理"""
        if self.path.startswith('/api/'):
            self.handle_api_post()
        else:
            self.send_error(404, "Not Found")
    
    def do_PUT(self):
        """PUTリクエスト: API処理（更新用）"""
        if self.path.startswith('/api/'):
            self.handle_api_put()
        else:
            self.send_error(404, "Not Found")
    
    def do_DELETE(self):
        """DELETEリクエスト: API処理（削除用）"""
        if self.path.startswith('/api/'):
            self.handle_api_delete()
        else:
            self.send_error(404, "Not Found")
    
    def handle_api_get(self):
        """API GET処理"""
        if self.path == '/api/services':
            # サービス一覧を返す
            try:
                with open(SERVICE_ITEMS_JSON, 'r', encoding='utf-8') as f:
                    services = json.load(f)
                self.send_json_response(services)
            except Exception as e:
                self.send_error(500, f"Failed to load services: {e}")
        else:
            self.send_error(404, "API endpoint not found")
    
    def handle_api_post(self):
        """API POST処理: 新規サービス登録"""
        if self.path == '/api/services':
            try:
                # リクエストボディを読み込む
                content_length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_length)
                service_data = json.loads(body.decode('utf-8'))
                
                # 既存のサービスを読み込む
                if SERVICE_ITEMS_JSON.exists():
                    with open(SERVICE_ITEMS_JSON, 'r', encoding='utf-8') as f:
                        services = json.load(f)
                else:
                    services = []
                
                # 新しいIDを生成
                max_id = max([s.get('id', 0) for s in services], default=0)
                new_id = max_id + 1
                service_data['id'] = new_id
                
                # 新しいサービスを追加
                services.append(service_data)
                
                # JSONファイルを保存
                with open(SERVICE_ITEMS_JSON, 'w', encoding='utf-8') as f:
                    json.dump(services, f, ensure_ascii=False, indent=2)
                
                # ビルドを実行（非同期）
                self.run_build_async()
                
                # 成功レスポンス
                self.send_json_response({
                    'status': 'success',
                    'id': new_id,
                    'message': 'サービスを登録しました'
                })
            except Exception as e:
                self.send_error(500, f"Failed to create service: {e}")
        else:
            self.send_error(404, "API endpoint not found")
    
    def handle_api_put(self):
        """API PUT処理: サービス更新"""
        # /api/services/{id} の形式をパース
        path_parts = self.path.split('/')
        if len(path_parts) == 4 and path_parts[1] == 'api' and path_parts[2] == 'services':
            service_id = int(path_parts[3])
            try:
                # リクエストボディを読み込む
                content_length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_length)
                service_data = json.loads(body.decode('utf-8'))
                
                # 既存のサービスを読み込む
                with open(SERVICE_ITEMS_JSON, 'r', encoding='utf-8') as f:
                    services = json.load(f)
                
                # サービスを更新
                updated = False
                for i, service in enumerate(services):
                    if service.get('id') == service_id:
                        service_data['id'] = service_id
                        services[i] = service_data
                        updated = True
                        break
                
                if not updated:
                    self.send_error(404, f"Service {service_id} not found")
                    return
                
                # JSONファイルを保存
                with open(SERVICE_ITEMS_JSON, 'w', encoding='utf-8') as f:
                    json.dump(services, f, ensure_ascii=False, indent=2)
                
                # ビルドを実行（非同期）
                self.run_build_async()
                
                # 成功レスポンス
                self.send_json_response({
                    'status': 'success',
                    'id': service_id,
                    'message': 'サービスを更新しました'
                })
            except Exception as e:
                self.send_error(500, f"Failed to update service: {e}")
        else:
            self.send_error(404, "API endpoint not found")
    
    def handle_api_delete(self):
        """API DELETE処理: サービス削除"""
        # /api/services/{id} の形式をパース
        path_parts = self.path.split('/')
        if len(path_parts) == 4 and path_parts[1] == 'api' and path_parts[2] == 'services':
            service_id = int(path_parts[3])
            try:
                # 既存のサービスを読み込む
                with open(SERVICE_ITEMS_JSON, 'r', encoding='utf-8') as f:
                    services = json.load(f)
                
                # サービスを削除
                services = [s for s in services if s.get('id') != service_id]
                
                # JSONファイルを保存
                with open(SERVICE_ITEMS_JSON, 'w', encoding='utf-8') as f:
                    json.dump(services, f, ensure_ascii=False, indent=2)
                
                # ビルドを実行（非同期）
                self.run_build_async()
                
                # 成功レスポンス
                self.send_json_response({
                    'status': 'success',
                    'id': service_id,
                    'message': 'サービスを削除しました'
                })
            except Exception as e:
                self.send_error(500, f"Failed to delete service: {e}")
        else:
            self.send_error(404, "API endpoint not found")
    
    def send_json_response(self, data, status=200):
        """JSONレスポンスを送信"""
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        response = json.dumps(data, ensure_ascii=False)
        self.wfile.write(response.encode('utf-8'))
    
    def run_build_async(self):
        """ビルドを非同期で実行（ページ生成を自動化）"""
        def build():
            try:
                result = subprocess.run(
                    [sys.executable, str(BUILD_SCRIPT)],
                    cwd=str(ROOT),
                    capture_output=True,
                    text=True,
                    timeout=30
                )
                if result.returncode != 0:
                    print(f"Build error: {result.stderr}", file=sys.stderr)
            except Exception as e:
                print(f"Build exception: {e}", file=sys.stderr)
        
        # 別スレッドでビルドを実行（レスポンスをブロックしない）
        thread = threading.Thread(target=build)
        thread.daemon = True
        thread.start()
    
    def log_message(self, format, *args):
        """ログメッセージをカスタマイズ"""
        # ビルドログを抑制
        if 'build.py' not in str(args):
            super().log_message(format, *args)


def main():
    """メイン関数: サーバーを起動"""
    if not PUBLIC.exists():
        print(f"Error: {PUBLIC} directory not found")
        print("Please run: python3 scripts/build.py")
        sys.exit(1)
    
    if not SERVICE_ITEMS_JSON.exists():
        print(f"Warning: {SERVICE_ITEMS_JSON} not found")
        print("Creating empty service_items.json...")
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        with open(SERVICE_ITEMS_JSON, 'w', encoding='utf-8') as f:
            json.dump([], f, ensure_ascii=False, indent=2)
    
    server = HTTPServer(('', PORT), DevServerHandler)
    print(f"開発サーバーを起動しました: http://localhost:{PORT}")
    print(f"APIエンドポイント: http://localhost:{PORT}/api/services")
    print("Ctrl+C で停止")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nサーバーを停止しました")
        server.shutdown()


if __name__ == '__main__':
    main()

