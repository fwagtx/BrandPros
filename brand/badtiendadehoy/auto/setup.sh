#!/usr/bin/env bash
# Gets a fresh container ready for Bad Tienda de Hoy. Safe to run every time: skips whatever is already there.
#   bash brand/badtiendadehoy/auto/setup.sh
set -euo pipefail
cd "$(dirname "$0")/../../.."
M=brand/badtiendadehoy/voice/models
python3 -c "import torch" 2>/dev/null || python3 -m pip install -q torch torchaudio --index-url https://download.pytorch.org/whl/cpu 2>&1 | grep -v "root" || true
python3 -c "import transformers, accelerate, librosa, soundfile, einops, onnxruntime, sox, faster_whisper, boto3, huggingface_hub, numpy" 2>/dev/null ||
  python3 -m pip install -q "transformers==4.57.3" "accelerate==1.12.0" librosa soundfile einops onnxruntime sox faster-whisper boto3 huggingface_hub numpy 2>&1 | grep -v "root" || true
python3 -c "import qwen_tts" 2>/dev/null || python3 -m pip install -q --no-deps qwen-tts 2>&1 | grep -v "root" || true
python3 -c "import qwen_tts, faster_whisper, boto3" 2>&1 | grep -vE "flash-attn|^\*+$|^ ?$|SoX|sourceforge|double-check|path variables|not found" || true
[ -f $M/Base/model.safetensors ] || python3 -c "from huggingface_hub import snapshot_download as s; s('Qwen/Qwen3-TTS-12Hz-1.7B-Base', local_dir='$M/Base')"
[ -f $M/whisper-small/model.bin ] || python3 -c "from huggingface_hub import snapshot_download as s; s('Systran/faster-whisper-small', local_dir='$M/whisper-small')"
node -e "try{require('playwright')}catch(e){require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright')}"
git ls-remote --exit-code --heads https://github.com/fwagtx/BrandPros claude/badtiendadehoy >/dev/null
echo "setup ok"
