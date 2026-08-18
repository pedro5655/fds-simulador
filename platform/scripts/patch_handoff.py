"""
Patch script: reescreve as secoes desatualizadas do handoff CONTINUAR-NO-ANTIGRAVITY.md.
Executar uma unica vez apos a producao do video ser concluida.
"""

from pathlib import Path

HANDOFF = Path(r"output\video\CONTINUAR-NO-ANTIGRAVITY.md")

with open(HANDOFF, encoding="utf-8") as f:
    lines = f.readlines()

# Encontrar a linha com o marcador antigo "Artefatos que ainda serao criados:"
start_idx = None
end_idx = None

for i, line in enumerate(lines):
    if "Artefatos que ainda ser" in line and "criados" in line:
        start_idx = i
    if start_idx is not None and "## Crit" in line:
        end_idx = i
        break

if start_idx is None or end_idx is None:
    print(f"Marcadores nao encontrados (start={start_idx}, end={end_idx}). Arquivo ja pode estar atualizado.")
    raise SystemExit(0)

print(f"Substituindo linhas {start_idx+1} ate {end_idx} (1-indexed)...")

new_section = """\
Artefatos criados e validados:

- `platform/public/training/rotina-visita.mp4` (82.50s, 720x1280, H.264 High Profile, AAC stereo 44.1kHz, faststart)
- `platform/public/training/rotina-visita.pt-BR.vtt` (WebVTT com cues sincronizados)
- `platform/public/training/rotina-visita-poster.jpg` (Poster frame oficial 720x1280)
- `platform/public/training/rotina-visita-transcricao.txt` (Transcricao completa com marcacoes de tempo)
- `output/video/rotina-visita-treinamento.mp4` (Copia fiel para arquivo e distribuicao)
- `output/video/rotina-visita-storyboard.jpg` (Storyboard consolidado 4x2 em alta definicao)
- `platform/scripts/build-training-video.py` (Pipeline reproduzivel completo)

## Ferramentas utilizadas

- Node/npm e dependencias do projeto.
- Python 3.13 com Pillow e NumPy para composicao grafica de frames.
- FFmpeg 9.0.1 portatil (`tmp/tools/ffmpeg/dist/ffmpeg-9.0.1-essentials_build/bin/ffmpeg.exe`).
- Windows SAPI voz pt-BR `Microsoft Maria Desktop - Portuguese(Brazil)` (Rate 5, mixagem 44.1kHz stereo).

## Resultados de validacao

| Verificacao | Resultado |
|---|---|
| ffprobe codec | H.264 High Profile, yuv420p, 24fps |
| ffprobe audio | AAC 44100Hz stereo |
| ffprobe duracao | 00:01:22.50 (82.50s) |
| ffprobe faststart | Confirmado (moov antes de mdat) |
| npm.cmd run lint | 0 erros, 0 avisos |
| npm.cmd run typecheck | 0 erros TypeScript |
| npm.cmd test | 35/35 testes passando |
| npm.cmd run build | Vite client OK ~776ms |
| npm.cmd audit | 0 vulnerabilidades |
| git diff --check | Limpo (exceto index.html/sw.js legados intocados) |
| HTTP /training/rotina-visita.mp4 | 200 video/mp4 |
| HTTP /training/rotina-visita.pt-BR.vtt | 200 text/vtt |
| HTTP /training/rotina-visita-poster.jpg | 200 image/jpeg |

## Comandos de execucao

Rerenderizar video e assets (se necessario):

```powershell
python platform/scripts/build-training-video.py
```

Validacoes de qualidade:

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
npm.cmd audit --omit=dev
```

Servidor local:

```powershell
npm.cmd run dev -- --host 127.0.0.1 --port 4173
```

"""

before = lines[:start_idx]
after = lines[end_idx:]

result = before + [new_section] + after

with open(HANDOFF, "w", encoding="utf-8") as f:
    f.writelines(result)

print(f"Feito. Arquivo reescrito com {len(result)} linhas.")
