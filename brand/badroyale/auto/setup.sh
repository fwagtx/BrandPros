#!/usr/bin/env bash
# Gets a fresh autopilot container ready to make BAD ROYALE videos. Safe to run every time:
# it skips whatever is already there. Run from anywhere: bash brand/badroyale/auto/setup.sh
set -euo pipefail
cd "$(dirname "$0")/../../.."
python3 -c "import kokoro_onnx, soundfile, imageio_ffmpeg, spellchecker, boto3" 2>/dev/null ||
  pip install -q kokoro-onnx soundfile imageio-ffmpeg pyspellchecker boto3 2>&1 | grep -v "running pip as the 'root' user" || true
python3 -c "import kokoro_onnx, soundfile, imageio_ffmpeg, spellchecker, boto3"
if [ ! -f brand/_shared/voice/models/model_quantized.onnx ] || [ ! -f brand/_shared/voice/models/voices.npz ]; then
  bash brand/_shared/voice/get_models.sh
fi
node -e "try{require('playwright')}catch(e){require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright')}"
python3 -c "import imageio_ffmpeg; imageio_ffmpeg.get_ffmpeg_exe()" >/dev/null
python3 brand/_shared/store.py ls >/dev/null
python3 brand/_shared/store.py sweep 48
echo "setup ok"
