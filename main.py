import os
import subprocess
import sys

# Render가 주는 포트 번호 받기 (없으면 8080)
port = os.environ.get("PORT", "8080")

print(f"🚀 Starting G4F API Server on port {port}...")

# [공식 명령어 실행]
# python -m g4f.api.run --bind 0.0.0.0:PORT
# 이 명령어가 G4F의 모든 기능을 OpenWebUI용으로 열어줍니다.
cmd = [sys.executable, "-m", "g4f.api.run", "--bind", f"0.0.0.0:{port}"]

# 서버 실행
subprocess.run(cmd)