import sys
from pathlib import Path

# Vercel Python 함수에서 Flask 앱을 재사용한다.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app import app  # noqa: E402
