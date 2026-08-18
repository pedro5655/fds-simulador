#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de produção do vídeo de treinamento do Modo Visita.
Gera áudio TTS pt-BR com SAPI Maria, legendas WebVTT, transcrição, composições de frame
com Pillow (cenas 3D + recortes reais do Book FDS + legendas queimadas + badges de segurança/metas),
e compila o MP4 vertical 9:16 (720x1280) via FFmpeg com H.264 e faststart.
"""

import os
import sys
import wave
import struct
import subprocess
import shutil
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# Configurações gerais
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SCENES_DIR = os.path.join(ROOT_DIR, 'platform', 'public', 'training', 'scenes')
BOOK_REF_DIR = os.path.join(ROOT_DIR, 'platform', 'public', 'training', 'book-references')
PUBLIC_TRAINING_DIR = os.path.join(ROOT_DIR, 'platform', 'public', 'training')
OUTPUT_VIDEO_DIR = os.path.join(ROOT_DIR, 'output', 'video')
TMP_DIR = os.path.join(ROOT_DIR, 'tmp', 'video_build')
FFMPEG_BIN = os.path.join(ROOT_DIR, 'tmp', 'tools', 'ffmpeg', 'dist', 'ffmpeg-9.0.1-essentials_build', 'bin', 'ffmpeg.exe')

WIDTH = 720
HEIGHT = 1280
FPS = 24

# Cores da identidade visual (Heineken Green / Night / Signal Lime / White)
COLOR_NIGHT = (7, 31, 26)             # #071F1A
COLOR_DARK_GREEN = (18, 57, 47)       # #12392F
COLOR_EMERALD = (0, 130, 59)          # #00823B
COLOR_SIGNAL = (169, 255, 71)         # #A9FF47 (lime)
COLOR_WHITE = (255, 255, 255)
COLOR_AMBER = (255, 177, 76)          # #FFB14C
COLOR_TEXT_MUTED = (190, 210, 202)

# Carregamento de Fontes
def get_font(bold=False, size=24):
    font_file = 'C:/Windows/Fonts/segoeuib.ttf' if bold else 'C:/Windows/Fonts/segoeui.ttf'
    if not os.path.exists(font_file):
        font_file = 'C:/Windows/Fonts/arialbd.ttf' if bold else 'C:/Windows/Fonts/arial.ttf'
    return ImageFont.truetype(font_file, size)

FONT_TITLE = get_font(bold=True, size=26)
FONT_SUBTITLE = get_font(bold=True, size=18)
FONT_BADGE = get_font(bold=True, size=16)
FONT_BADGE_SM = get_font(bold=True, size=14)
FONT_BODY = get_font(bold=False, size=18)
FONT_CAPTIONS = get_font(bold=True, size=23)
FONT_NOTE = get_font(bold=False, size=14)
FONT_OUTRO_TITLE = get_font(bold=True, size=34)
FONT_OUTRO_SUB = get_font(bold=False, size=20)

# Roteiro Obrigatório dos 8 Momentos
SCRIPT = [
    {
        'id': 1,
        'moment_num': '01',
        'title': 'RECEPÇÃO E APRESENTAÇÃO',
        'phase': 'Entrada e Condução',
        'scene_file': '01-recepcao.png',
        'sentences': [
            'Olá, meu nome é Pedro. Tenho cinco anos de companhia e atendo esta loja há um ano.',
            'Eu conduzirei a visita de vocês pela loja.'
        ],
        'cue': 'Recepção na porta da loja',
        'badges': [
            ('ROTINA DE VISITA', COLOR_SIGNAL, COLOR_NIGHT),
            ('Segurança · Clareza · Execução', COLOR_WHITE, COLOR_DARK_GREEN)
        ],
        'note': 'Pedro · 5 anos de Cia · 1 ano na loja'
    },
    {
        'id': 2,
        'moment_num': '02',
        'title': 'SEGURANÇA ANTES DE COMEÇAR',
        'phase': 'Rotas e EPIs',
        'scene_file': '02-seguranca.png',
        'sentences': [
            'Antes de começarmos, gostaria de sinalizar as saídas de emergência.',
            'Aproveitando que estamos falando de segurança, quero mostrar também os EPIs que utilizo: luvas e óculos de proteção.'
        ],
        'cue': 'Sinalização de saídas e verificação de EPIs',
        'alert': 'Sinalizar somente riscos reais observados',
        'badges': [
            ('SAÍDAS DE EMERGÊNCIA', COLOR_SIGNAL, COLOR_NIGHT),
            ('EPIs: Luvas + Óculos', COLOR_WHITE, COLOR_DARK_GREEN)
        ],
        'note': 'Alerte riscos reais durante o percurso'
    },
    {
        'id': 3,
        'moment_num': '03',
        'title': 'SEÇÃO CRAFT',
        'phase': 'Planograma & Meta',
        'scene_file': '03-craft.png',
        'book_ref': 'book-p16-craft-planogram.png',
        'sentences': [
            'Aqui é o nosso espaço de Craft.',
            'Executamos as cervejas da mais escura para a mais clara, seguindo o planograma da companhia.',
            'Nossa meta na categoria é 53% e hoje estamos em X%.'
        ],
        'cue': 'Apresentação da gôndola Craft',
        'rule': 'Regra: da mais escura para a mais clara (exclusiva Craft)',
        'meta': 'Meta da categoria: 53% · Hoje: X%',
        'badges': [
            ('CRAFT · GÔNDOLA', COLOR_SIGNAL, COLOR_NIGHT),
            ('Meta: 53%', COLOR_WHITE, COLOR_EMERALD)
        ],
        'note': 'Exemplo de execução — cada loja tem sua individualidade'
    },
    {
        'id': 4,
        'moment_num': '04',
        'title': 'SEÇÃO PREMIUM',
        'phase': 'Planograma & Destaques',
        'scene_file': '04-premium.png',
        'book_ref': 'book-p16-premium-planogram.png',
        'sentences': [
            'Aqui está a categoria Premium.',
            'Apresentamos o planograma e os principais destaques da execução.',
            'Nossa meta é 57% e hoje estamos em X%.'
        ],
        'cue': 'Apresentação da gôndola Premium',
        'rule': 'Foco: planograma e destaques da execução',
        'meta': 'Meta da categoria: 57% · Hoje: X%',
        'badges': [
            ('PREMIUM · GÔNDOLA', COLOR_SIGNAL, COLOR_NIGHT),
            ('Meta: 57%', COLOR_WHITE, COLOR_EMERALD)
        ],
        'note': 'Exemplo de execução — cada loja tem sua individualidade'
    },
    {
        'id': 5,
        'moment_num': '05',
        'title': 'SEÇÃO MAINSTREAM',
        'phase': 'Organização & Presença',
        'scene_file': '05-mainstream.png',
        'book_ref': 'book-p16-mainstream-planogram.png',
        'sentences': [
            'Na categoria Mainstream, mostramos a organização e a presença dos produtos.',
            'Nossa meta é 25% e hoje estamos em X%.'
        ],
        'cue': 'Apresentação da gôndola Mainstream',
        'rule': 'Foco: organização e presença de portfólio',
        'meta': 'Meta da categoria: 25% · Hoje: X%',
        'badges': [
            ('MAINSTREAM · GÔNDOLA', COLOR_SIGNAL, COLOR_NIGHT),
            ('Meta: 25%', COLOR_WHITE, COLOR_EMERALD)
        ],
        'note': 'Exemplo de execução — cada loja tem sua individualidade'
    },
    {
        'id': 6,
        'moment_num': '06',
        'title': 'PONTOS EXTRAS',
        'phase': 'Execuções de Alto Impacto',
        'scene_file': '06-pontos-extras.png',
        'pe_composite': True,
        'sentences': [
            'Neste exemplo, a loja está na faixa de 11 a 15 pontos extras.',
            'A meta é três Premium, dois Mainstream e um Craft.',
            'Hoje estamos executando X em cada categoria.'
        ],
        'cue': 'Apresentação dos Pontos Extras da loja',
        'rule': 'Faixa 11 a 15 PEs · Meta: 3 Premium, 2 Mainstream, 1 Craft',
        'meta': 'Execução: X Premium, X Mainstream, X Craft',
        'badges': [
            ('PONTOS EXTRAS', COLOR_SIGNAL, COLOR_NIGHT),
            ('Faixa 11 a 15 PEs', COLOR_WHITE, COLOR_DARK_GREEN)
        ],
        'note': 'Exemplo de execução — cada loja tem sua individualidade'
    },
    {
        'id': 7,
        'moment_num': '07',
        'title': 'GELADEIRA',
        'phase': 'Disponibilidade e Cuidado',
        'scene_file': '07-geladeira.png',
        'book_ref': 'book-p24-cooler-planogram.png',
        'sentences': [
            'Agora apresentamos a geladeira: organização, disponibilidade e qualidade da execução.',
            'É o momento de destacar o cuidado aplicado no ponto de venda.'
        ],
        'cue': 'Apresentação da área refrigerada / geladeiras',
        'rule': 'Foco: disponibilidade de produto gelado e cuidado',
        'meta': 'Ponto de Venda pronto para o shopper',
        'badges': [
            ('GELADEIRA & REFRIGERADOS', COLOR_SIGNAL, COLOR_NIGHT),
            ('Disponibilidade e Qualidade', COLOR_WHITE, COLOR_DARK_GREEN)
        ],
        'note': 'Exemplo de execução — cada loja tem sua individualidade'
    },
    {
        'id': 8,
        'moment_num': '08',
        'title': 'RETORNO À PORTA E QR',
        'phase': 'Avaliação e Encerramento',
        'scene_file': '08-encerramento.png',
        'sentences': [
            'Agora, convido vocês a escanear o QR Code no meu celular para uma avaliação rápida sobre a segurança durante a visita.',
            'Agradeço pela presença e lembro: os nossos cuidados não terminam na loja.',
            'Segurança é sempre em primeiro lugar.'
        ],
        'cue': 'Apresentação do QR no celular e encerramento',
        'badges': [
            ('AVALIAÇÃO DE SEGURANÇA', COLOR_SIGNAL, COLOR_NIGHT),
            ('QR Code ilustrativo', COLOR_WHITE, COLOR_DARK_GREEN)
        ],
        'note': 'QR genérico · Segurança em primeiro lugar'
    }
]

def format_vtt_timestamp(seconds):
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    msecs = int(round((seconds - int(seconds)) * 1000))
    return f"{hours:02d}:{minutes:02d}:{secs:02d}.{msecs:03d}"

def generate_tts_audio():
    print("--- 1. Gerando áudio TTS com SAPI Maria pt-BR ---")
    import win32com.client
    speaker = win32com.client.Dispatch('SAPI.SpVoice')
    for v in speaker.GetVoices():
        if 'Maria' in v.GetDescription():
            speaker.Voice = v
            print(f"Voz selecionada: {v.GetDescription()}")
            break
    speaker.Rate = 5

    os.makedirs(os.path.join(TMP_DIR, 'audio_clips'), exist_ok=True)
    
    timing_data = []
    
    for moment in SCRIPT:
        m_id = moment['id']
        m_sentences = []
        for s_idx, sentence_text in enumerate(moment['sentences']):
            wav_path = os.path.join(TMP_DIR, 'audio_clips', f'm{m_id}_s{s_idx+1}.wav')
            fs = win32com.client.Dispatch('SAPI.SpFileStream')
            fs.Open(wav_path, 3, False)
            speaker.AudioOutputStream = fs
            speaker.Speak(sentence_text)
            fs.Close()
            
            with wave.open(wav_path, 'rb') as w:
                nframes = w.getnframes()
                rate = w.getframerate()
                dur = nframes / float(rate)
                
            m_sentences.append({
                'idx': s_idx + 1,
                'text': sentence_text,
                'wav_path': wav_path,
                'speech_dur': dur
            })
        timing_data.append({
            'moment': moment,
            'sentences': m_sentences
        })
    return timing_data

def build_full_audio_track_and_timeline(timing_data):
    print("--- 2. Montando trilha de áudio final e timeline ---")
    timeline_events = []
    current_time = 0.0
    
    full_audio_segments = []
    
    for item in timing_data:
        moment = item['moment']
        m_start_time = current_time
        
        # Pausa inicial do momento
        lead_in = 0.20
        full_audio_segments.append(('silence', lead_in))
        current_time += lead_in
        
        sentence_timings = []
        for s in item['sentences']:
            s_start = current_time
            full_audio_segments.append(('file', s['wav_path']))
            current_time += s['speech_dur']
            s_end = current_time
            
            sentence_timings.append({
                'text': s['text'],
                'start': s_start,
                'end': s_end,
                'speech_dur': s['speech_dur']
            })
            
            # Pausa entre frases
            inter_sentence = 0.20
            full_audio_segments.append(('silence', inter_sentence))
            current_time += inter_sentence
            
        # Momento 8 tem hold da tela final
        if moment['id'] == 8:
            outro_hold = 2.80
            full_audio_segments.append(('silence', outro_hold))
            current_time += outro_hold
            
        lead_out = 0.15
        full_audio_segments.append(('silence', lead_out))
        current_time += lead_out
        
        m_end_time = current_time
        
        timeline_events.append({
            'moment': moment,
            'start_time': m_start_time,
            'end_time': m_end_time,
            'duration': m_end_time - m_start_time,
            'sentences': sentence_timings
        })

    # Renderizar master WAV unificado (44100Hz, 16bit, stereo)
    master_wav_path = os.path.join(TMP_DIR, 'master_audio.wav')
    sample_rate = 44100
    
    with wave.open(master_wav_path, 'wb') as out_w:
        out_w.setnchannels(2)
        out_w.setsampwidth(2)
        out_w.setframerate(sample_rate)
        
        for seg_type, param in full_audio_segments:
            if seg_type == 'silence':
                num_samples = int(param * sample_rate)
                silence_bytes = b'\x00\x00\x00\x00' * num_samples
                out_w.writeframes(silence_bytes)
            elif seg_type == 'file':
                with wave.open(param, 'rb') as in_w:
                    in_nchannels = in_w.getnchannels()
                    in_sampwidth = in_w.getsampwidth()
                    in_rate = in_w.getframerate()
                    in_frames = in_w.readframes(in_w.getnframes())
                    
                    if in_sampwidth == 2:
                        fmt = f"<{len(in_frames)//2}h"
                        samples = struct.unpack(fmt, in_frames)
                    else:
                        raise ValueError(f"Formato não suportado: sampwidth={in_sampwidth}")
                        
                    ratio = sample_rate / float(in_rate)
                    out_num_samples = int(len(samples) * ratio)
                    
                    out_samples = []
                    for i in range(out_num_samples):
                        src_idx = int(i / ratio)
                        src_idx = min(src_idx, len(samples) - 1)
                        val = samples[src_idx]
                        out_samples.append(val)
                        out_samples.append(val)
                        
                    out_fmt = f"<{len(out_samples)}h"
                    out_bytes = struct.pack(out_fmt, *out_samples)
                    out_w.writeframes(out_bytes)
                    
    total_audio_dur = current_time
    print(f"Áudio mestre gerado em {master_wav_path} (Duração total: {total_audio_dur:.2f}s)")
    return timeline_events, master_wav_path, total_audio_dur

def generate_vtt_and_transcript(timeline_events, total_dur):
    print("--- 3. Gerando arquivos WebVTT e Transcrição em texto ---")
    vtt_path = os.path.join(PUBLIC_TRAINING_DIR, 'rotina-visita.pt-BR.vtt')
    txt_path = os.path.join(PUBLIC_TRAINING_DIR, 'rotina-visita-transcricao.txt')
    
    vtt_lines = ["WEBVTT", "Kind: captions", "Language: pt-BR", ""]
    txt_lines = [
        "VÍDEO DE TREINAMENTO — ROTEIRO DE CONDUÇÃO NO MODO VISITA",
        "Heineken Brasil · Fotografia de Sucesso (FDS) 2026",
        f"Duração total: {int(total_dur // 60):02d}:{int(total_dur % 60):02d} | 8 Momentos Padronizados",
        "Nota: Este material é um exemplo de treinamento independente da avaliação real da loja.",
        "=" * 70,
        ""
    ]
    
    cue_idx = 1
    for m in timeline_events:
        moment = m['moment']
        txt_lines.append(f"MOMENTO {moment['moment_num']} · {moment['title']} [{format_vtt_timestamp(m['start_time'])[:8]} - {format_vtt_timestamp(m['end_time'])[:8]}]")
        txt_lines.append(f"Contexto/Cena: {moment['cue']}")
        
        for s in m['sentences']:
            start_str = format_vtt_timestamp(s['start'])
            end_str = format_vtt_timestamp(s['end'])
            
            vtt_lines.append(str(cue_idx))
            vtt_lines.append(f"{start_str} --> {end_str}")
            vtt_lines.append(s['text'])
            vtt_lines.append("")
            
            txt_lines.append(f"  [{start_str[:8]}] \"{s['text']}\"")
            cue_idx += 1
            
        if moment['id'] == 8:
            txt_lines.append(f"  [{format_vtt_timestamp(m['end_time']-3.5)[:8]}] Mensagem final: \"Visita bem conduzida é segurança + clareza + execução\"")
            
        txt_lines.append("")
        
    with open(vtt_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(vtt_lines))
        
    with open(txt_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(txt_lines))
        
    print(f"VTT salvo: {vtt_path}")
    print(f"Transcrição salva: {txt_path}")

def wrap_text(text, max_chars=34):
    words = text.split()
    lines = []
    curr = []
    curr_len = 0
    for w in words:
        if curr_len + len(w) + (1 if curr else 0) <= max_chars:
            curr.append(w)
            curr_len += len(w) + (1 if len(curr) > 1 else 0)
        else:
            if curr:
                lines.append(" ".join(curr))
            curr = [w]
            curr_len = len(w)
    if curr:
        lines.append(" ".join(curr))
    return lines

def create_base_scene_image(scene_filename):
    scene_path = os.path.join(SCENES_DIR, scene_filename)
    with Image.open(scene_path) as img:
        img = img.convert('RGB')
        src_w, src_h = img.size
        scale = max(WIDTH / float(src_w), HEIGHT / float(src_h))
        new_w = int(src_w * scale)
        new_h = int(src_h * scale)
        img_resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        left = (new_w - WIDTH) // 2
        top = (new_h - HEIGHT) // 2
        img_cropped = img_resized.crop((left, top, left + WIDTH, top + HEIGHT))
        
        overlay = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
        draw_ov = ImageDraw.Draw(overlay)
        
        for y in range(160):
            alpha = int(210 * (1.0 - y / 160.0))
            draw_ov.line([(0, y), (WIDTH, y)], fill=(7, 31, 26, alpha))
            
        for y in range(950, HEIGHT):
            factor = (y - 950) / float(HEIGHT - 950)
            alpha = int(230 * factor)
            draw_ov.line([(0, y), (WIDTH, y)], fill=(7, 31, 26, alpha))
            
        return Image.alpha_composite(img_cropped.convert('RGBA'), overlay).convert('RGB')

def draw_rounded_rect(draw, bbox, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(bbox, radius=radius, fill=fill, outline=outline, width=width)

def render_frame_for_moment(moment_event, current_t, base_img_cache, book_cache):
    moment = moment_event['moment']
    m_id = moment['id']
    
    base_img = base_img_cache[moment['scene_file']].copy()
    img = base_img.convert('RGBA')
    draw = ImageDraw.Draw(img)
    
    # ----------------------------------------------------
    # 1. HEADER DO MOMENTO (Topo da tela)
    # ----------------------------------------------------
    draw_rounded_rect(draw, (24, 20, WIDTH - 24, 98), radius=16, fill=(7, 31, 26, 235), outline=(169, 255, 71, 100), width=1)
    
    draw.text((40, 30), f"MOMENTO {moment['moment_num']} / 08", fill=COLOR_SIGNAL, font=FONT_BADGE)
    draw.text((220, 31), f"· {moment['phase']}", fill=COLOR_TEXT_MUTED, font=FONT_BADGE_SM)
    draw.text((40, 58), moment['title'], fill=COLOR_WHITE, font=FONT_TITLE)
    
    dot_start_x = WIDTH - 180
    for d in range(1, 9):
        dot_x = dot_start_x + (d - 1) * 16
        dot_color = COLOR_SIGNAL if d == m_id else (COLOR_EMERALD if d < m_id else (100, 120, 115))
        draw.ellipse((dot_x, 34, dot_x + 8, 42), fill=dot_color)

    # ----------------------------------------------------
    # 2. OVERLAYS CONTEXTUAIS E RECORTES DO BOOK
    # ----------------------------------------------------
    is_outro_screen = (m_id == 8 and (moment_event['end_time'] - current_t) <= 3.5)
    
    if is_outro_screen:
        outro_overlay = Image.new('RGBA', (WIDTH, HEIGHT), (7, 31, 26, 245))
        img = Image.alpha_composite(img, outro_overlay)
        draw = ImageDraw.Draw(img)
        
        box_y1 = 380
        box_y2 = 820
        draw_rounded_rect(draw, (36, box_y1, WIDTH - 36, box_y2), radius=24, fill=(18, 57, 47, 240), outline=COLOR_SIGNAL, width=2)
        
        draw.text((WIDTH // 2, box_y1 + 50), "★ HEINEKEN BRASIL ★", fill=COLOR_SIGNAL, font=FONT_BADGE, anchor="mt")
        draw.text((WIDTH // 2, box_y1 + 90), "ROTINA DE VISITA CONCLUÍDA", fill=COLOR_TEXT_MUTED, font=FONT_SUBTITLE, anchor="mt")
        
        outro_lines = [
            "Visita bem conduzida é:",
            "SEGURANÇA + CLAREZA",
            "+ VALORIZAÇÃO DA EXECUÇÃO"
        ]
        curr_y = box_y1 + 160
        for ol in outro_lines:
            color = COLOR_SIGNAL if "+" in ol or "SEGURANÇA" in ol else COLOR_WHITE
            draw.text((WIDTH // 2, curr_y), ol, fill=color, font=FONT_OUTRO_TITLE, anchor="mt")
            curr_y += 48
            
        draw.text((WIDTH // 2, box_y2 - 60), "Treinamento Interno · Fotografia de Sucesso 2026", fill=COLOR_TEXT_MUTED, font=FONT_NOTE, anchor="mt")

    else:
        if m_id == 1:
            card_y = 120
            draw_rounded_rect(draw, (32, card_y, WIDTH - 32, card_y + 90), radius=14, fill=(7, 31, 26, 210), outline=(169, 255, 71, 90), width=1)
            draw.text((48, card_y + 16), "CONDUTOR DA VISITA", fill=COLOR_SIGNAL, font=FONT_BADGE)
            draw.text((48, card_y + 44), "Pedro · 5 anos de companhia · 1 ano atendendo a loja", fill=COLOR_WHITE, font=FONT_BODY)

        elif m_id == 2:
            card_y = 120
            draw_rounded_rect(draw, (32, card_y, WIDTH - 32, card_y + 140), radius=16, fill=(7, 31, 26, 230), outline=COLOR_AMBER, width=2)
            
            draw_rounded_rect(draw, (48, card_y + 16, 230, card_y + 44), radius=8, fill=COLOR_AMBER)
            draw.text((60, card_y + 22), "PROTOCOLO DE SEGURANÇA", fill=COLOR_NIGHT, font=FONT_BADGE_SM)
            
            draw.text((48, card_y + 56), "• Sinalizar saídas de emergência e rotas seguras", fill=COLOR_WHITE, font=FONT_BODY)
            draw.text((48, card_y + 82), "• EPIs obrigatórios: Luvas e Óculos de proteção", fill=COLOR_WHITE, font=FONT_BODY)
            draw.text((48, card_y + 108), "• Alerte somente riscos reais observados na loja", fill=COLOR_AMBER, font=FONT_BADGE_SM)

        elif m_id in [3, 4, 5, 7]:
            card_y = 115
            card_h = 420
            draw_rounded_rect(draw, (28, card_y, WIDTH - 28, card_y + card_h), radius=18, fill=(7, 31, 26, 235), outline=(169, 255, 71, 140), width=1)
            
            draw_rounded_rect(draw, (44, card_y + 14, 235, card_y + 40), radius=6, fill=COLOR_EMERALD)
            draw.text((54, card_y + 18), "BOOK FDS 2026 · PLANOGRAMA", fill=COLOR_WHITE, font=FONT_BADGE_SM)
            
            if 'meta' in moment:
                draw.text((WIDTH - 44, card_y + 18), moment['meta'], fill=COLOR_SIGNAL, font=FONT_BADGE, anchor="rt")
                
            ref_img = book_cache.get(moment['book_ref'])
            if ref_img:
                img_box_y = card_y + 50
                img_box_h = 290
                target_w = WIDTH - 72
                target_h = img_box_h
                rw, rh = ref_img.size
                scale = min(target_w / float(rw), target_h / float(rh))
                pw = int(rw * scale)
                ph = int(rh * scale)
                px = (WIDTH - pw) // 2
                py = img_box_y + (target_h - ph) // 2
                
                draw_rounded_rect(draw, (px - 2, py - 2, px + pw + 2, py + ph + 2), radius=8, fill=(255, 255, 255, 255))
                img.paste(ref_img.resize((pw, ph), Image.Resampling.LANCZOS), (px, py))
                
            draw_rounded_rect(draw, (40, card_y + card_h - 68, WIDTH - 40, card_y + card_h - 14), radius=10, fill=(18, 57, 47, 240), outline=(169, 255, 71, 80), width=1)
            draw.text((WIDTH // 2, card_y + card_h - 58), moment['note'], fill=COLOR_SIGNAL, font=FONT_BADGE_SM, anchor="mt")
            
            if 'rule' in moment:
                rule_color = COLOR_SIGNAL if "escura para a mais clara" in moment['rule'] else COLOR_WHITE
                draw.text((WIDTH // 2, card_y + card_h - 36), moment['rule'], fill=rule_color, font=FONT_BADGE_SM, anchor="mt")

        elif m_id == 6:
            card_y = 115
            card_h = 440
            draw_rounded_rect(draw, (28, card_y, WIDTH - 28, card_y + card_h), radius=18, fill=(7, 31, 26, 235), outline=(169, 255, 71, 140), width=1)
            
            draw_rounded_rect(draw, (44, card_y + 14, 250, card_y + 40), radius=6, fill=COLOR_EMERALD)
            draw.text((54, card_y + 18), "BOOK FDS 2026 · PONTOS EXTRAS", fill=COLOR_WHITE, font=FONT_BADGE_SM)
            draw.text((WIDTH - 44, card_y + 18), "Faixa 11 a 15 PEs", fill=COLOR_SIGNAL, font=FONT_BADGE, anchor="rt")
            
            pe_keys = [
                ('Premium (p29)', 'book-p29-premium-pe.png'),
                ('Mainstream (p29)', 'book-p29-mainstream-pe.png'),
                ('Craft (p29)', 'book-p29-craft-pe.png'),
                ('Backlight (p31)', 'book-p31-backlight-pe.png')
            ]
            grid_y = card_y + 50
            gw = 310
            gh = 140
            positions = [
                (44, grid_y),
                (WIDTH - 44 - gw, grid_y),
                (44, grid_y + gh + 10),
                (WIDTH - 44 - gw, grid_y + gh + 10)
            ]
            
            for (label, fname), (gx, gy) in zip(pe_keys, positions):
                pe_img = book_cache.get(fname)
                if pe_img:
                    draw_rounded_rect(draw, (gx, gy, gx + gw, gy + gh), radius=8, fill=(255, 255, 255, 255))
                    rw, rh = pe_img.size
                    sc = min((gw - 4) / float(rw), (gh - 24) / float(rh))
                    pw = int(rw * sc)
                    ph = int(rh * sc)
                    px = gx + (gw - pw) // 2
                    py = gy + 4 + ((gh - 24) - ph) // 2
                    img.paste(pe_img.resize((pw, ph), Image.Resampling.LANCZOS), (px, py))
                    
                    draw_rounded_rect(draw, (gx + 4, gy + gh - 22, gx + gw - 4, gy + gh - 2), radius=4, fill=(7, 31, 26, 220))
                    draw.text((gx + gw // 2, gy + gh - 20), label, fill=COLOR_SIGNAL, font=FONT_NOTE, anchor="mt")

            draw_rounded_rect(draw, (40, card_y + card_h - 75, WIDTH - 40, card_y + card_h - 12), radius=10, fill=(18, 57, 47, 240), outline=(169, 255, 71, 80), width=1)
            draw.text((WIDTH // 2, card_y + card_h - 66), moment['note'], fill=COLOR_SIGNAL, font=FONT_BADGE_SM, anchor="mt")
            draw.text((WIDTH // 2, card_y + card_h - 44), "Meta da loja: 3 Premium · 2 Mainstream · 1 Craft | Hoje: X", fill=COLOR_WHITE, font=FONT_BADGE_SM, anchor="mt")

        elif m_id == 8:
            card_y = 120
            draw_rounded_rect(draw, (32, card_y, WIDTH - 32, card_y + 180), radius=16, fill=(7, 31, 26, 230), outline=COLOR_SIGNAL, width=1)
            draw.text((48, card_y + 16), "AVALIAÇÃO DE SEGURANÇA", fill=COLOR_SIGNAL, font=FONT_BADGE)
            draw.text((48, card_y + 44), "Apresentar QR Code no celular para avaliação dos participantes", fill=COLOR_WHITE, font=FONT_BODY)
            draw.text((48, card_y + 72), "• Verificação de EPIs, saídas de emergência e rotas", fill=COLOR_TEXT_MUTED, font=FONT_BODY)
            
            draw_rounded_rect(draw, (48, card_y + 108, WIDTH - 48, card_y + 160), radius=10, fill=(18, 57, 47, 240), outline=COLOR_SIGNAL, width=1)
            draw.text((WIDTH // 2, card_y + 120), "“Segurança é sempre em primeiro lugar”", fill=COLOR_SIGNAL, font=FONT_SUBTITLE, anchor="mt")

    # ----------------------------------------------------
    # 3. LEGENDAS QUEIMADAS (Burned-in Subtitles)
    # ----------------------------------------------------
    active_sentence = None
    if not is_outro_screen:
        for s in moment_event['sentences']:
            if s['start'] <= current_t <= s['end']:
                active_sentence = s['text']
                break
                
    if active_sentence:
        lines = wrap_text(active_sentence, max_chars=34)
        box_padding_v = 18
        line_height = 32
        box_h = box_padding_v * 2 + len(lines) * line_height
        box_y1 = HEIGHT - 210 - (box_h - 80)
        box_y2 = box_y1 + box_h
        
        draw_rounded_rect(draw, (24, box_y1, WIDTH - 24, box_y2), radius=14, fill=(7, 31, 26, 235), outline=(169, 255, 71, 140), width=1)
        
        for l_idx, line_txt in enumerate(lines):
            ly = box_y1 + box_padding_v + l_idx * line_height
            draw.text((WIDTH // 2 + 1, ly + 1), line_txt, fill=(0, 0, 0, 200), font=FONT_CAPTIONS, anchor="mt")
            draw.text((WIDTH // 2, ly), line_txt, fill=COLOR_WHITE, font=FONT_CAPTIONS, anchor="mt")

    return img.convert('RGB')

def render_storyboard(timeline_events, base_img_cache, book_cache):
    print("--- 4. Gerando Storyboard dos 8 Momentos ---")
    storyboard_path = os.path.join(OUTPUT_VIDEO_DIR, 'rotina-visita-storyboard.jpg')
    poster_path = os.path.join(PUBLIC_TRAINING_DIR, 'rotina-visita-poster.jpg')
    os.makedirs(OUTPUT_VIDEO_DIR, exist_ok=True)
    
    moment_frames = []
    for m in timeline_events:
        sample_t = m['sentences'][0]['start'] + m['sentences'][0]['speech_dur'] * 0.5
        frame = render_frame_for_moment(m, sample_t, base_img_cache, book_cache)
        moment_frames.append(frame)
        
    moment_frames[0].save(poster_path, 'JPEG', quality=95)
    print(f"Poster salvo em: {poster_path}")
    
    grid_w = 4 * 360
    grid_h = 2 * 640 + 100
    sb_img = Image.new('RGB', (grid_w, grid_h), COLOR_NIGHT)
    sb_draw = ImageDraw.Draw(sb_img)
    
    sb_draw.text((grid_w // 2, 25), "STORYBOARD · VÍDEO DE TREINAMENTO DO MODO VISITA (8 MOMENTOS)", fill=COLOR_SIGNAL, font=get_font(bold=True, size=28), anchor="mt")
    sb_draw.text((grid_w // 2, 60), "Heineken Brasil · Fotografia de Sucesso 2026 · Formato 9:16 Vertical", fill=COLOR_TEXT_MUTED, font=get_font(bold=False, size=18), anchor="mt")
    
    thumb_w = 360
    thumb_h = 640
    for idx, frame in enumerate(moment_frames):
        col = idx % 4
        row = idx // 4
        x = col * thumb_w
        y = 100 + row * thumb_h
        
        resized_frame = frame.resize((thumb_w - 8, thumb_h - 8), Image.Resampling.LANCZOS)
        sb_img.paste(resized_frame, (x + 4, y + 4))
        sb_draw.rectangle((x + 4, y + 4, x + thumb_w - 4, y + thumb_h - 4), outline=(169, 255, 71, 100), width=1)
        
    sb_img.save(storyboard_path, 'JPEG', quality=90)
    print(f"Storyboard salvo em: {storyboard_path}")

def render_video(timeline_events, master_wav_path, total_dur, base_img_cache, book_cache):
    print(f"--- 5. Renderizando vídeo H.264 vertical 9:16 ({WIDTH}x{HEIGHT} @ {FPS}fps) ---")
    mp4_public_path = os.path.join(PUBLIC_TRAINING_DIR, 'rotina-visita.mp4')
    mp4_output_path = os.path.join(OUTPUT_VIDEO_DIR, 'rotina-visita-treinamento.mp4')
    
    total_frames = int(total_dur * FPS)
    print(f"Total de frames a renderizar: {total_frames} (~{total_dur:.2f}s)")
    
    ffmpeg_cmd = [
        FFMPEG_BIN,
        '-y',
        '-f', 'rawvideo',
        '-vcodec', 'rawvideo',
        '-s', f'{WIDTH}x{HEIGHT}',
        '-pix_fmt', 'rgb24',
        '-r', str(FPS),
        '-i', '-',
        '-i', master_wav_path,
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-profile:v', 'high',
        '-preset', 'fast',
        '-crf', '20',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-movflags', '+faststart',
        '-shortest',
        mp4_public_path
    ]
    
    proc = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    
    curr_moment_idx = 0
    for frame_idx in range(total_frames):
        current_t = frame_idx / float(FPS)
        
        while curr_moment_idx < len(timeline_events) - 1 and current_t > timeline_events[curr_moment_idx]['end_time']:
            curr_moment_idx += 1
            
        m_event = timeline_events[curr_moment_idx]
        frame_img = render_frame_for_moment(m_event, current_t, base_img_cache, book_cache)
        
        proc.stdin.write(frame_img.tobytes())
        
        if frame_idx % 250 == 0 or frame_idx == total_frames - 1:
            pct = (frame_idx + 1) / float(total_frames) * 100
            print(f"Progresso de renderização: {pct:.1f}% ({frame_idx+1}/{total_frames} frames)...")
            
    proc.stdin.close()
    stdout, stderr = proc.communicate()
    
    if proc.returncode != 0:
        print("Erro ao renderizar vídeo com FFmpeg:")
        print(stderr.decode('utf-8', errors='ignore'))
        sys.exit(proc.returncode)
        
    print(f"Vídeo renderizado com sucesso em: {mp4_public_path}")
    shutil.copyfile(mp4_public_path, mp4_output_path)
    print(f"Cópia salva em: {mp4_output_path}")

def main():
    print("==================================================================")
    print(" INICIANDO PIPELINE DE PRODUÇÃO DO VÍDEO DE TREINAMENTO MODO VISITA")
    print("==================================================================")
    
    os.makedirs(TMP_DIR, exist_ok=True)
    os.makedirs(PUBLIC_TRAINING_DIR, exist_ok=True)
    os.makedirs(OUTPUT_VIDEO_DIR, exist_ok=True)
    
    print("Carregando assets gráficos...")
    base_img_cache = {}
    for m in SCRIPT:
        sc_file = m['scene_file']
        if sc_file not in base_img_cache:
            base_img_cache[sc_file] = create_base_scene_image(sc_file)
            
    book_cache = {}
    for fname in os.listdir(BOOK_REF_DIR):
        if fname.endswith('.png'):
            fpath = os.path.join(BOOK_REF_DIR, fname)
            with Image.open(fpath) as b_img:
                book_cache[fname] = b_img.convert('RGBA')
                
    timing_data = generate_tts_audio()
    timeline_events, master_wav_path, total_dur = build_full_audio_track_and_timeline(timing_data)
    generate_vtt_and_transcript(timeline_events, total_dur)
    render_storyboard(timeline_events, base_img_cache, book_cache)
    render_video(timeline_events, master_wav_path, total_dur, base_img_cache, book_cache)
    
    print("==================================================================")
    print(" PRODUÇÃO AUDIOVISUAL CONCLUÍDA COM SUCESSO!")
    print(f" Duração final: {total_dur:.2f}s | 8 Momentos | Formato 9:16 (720x1280)")
    print("==================================================================")

if __name__ == '__main__':
    main()
