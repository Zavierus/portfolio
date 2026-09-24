# Builder for Job Autopilot Extension
from pathlib import Path

EXT_DIR = Path('../job-autopilot-extension')
EXT_DIR.mkdir(parents=True, exist_ok=True)
(EXT_DIR / 'popup').mkdir(parents=True, exist_ok=True)
(EXT_DIR / 'icons').mkdir(parents=True, exist_ok=True)
print('Extension path:', EXT_DIR.resolve())
