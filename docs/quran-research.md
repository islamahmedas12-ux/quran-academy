# Quran Research — Phase 3 Data Sources

## 1. Quran Text Data Sources

### Recommended: Al-Quran.cloud API
**Status**: Best option for self-hosted integration  
**URL**: https://alquran.cloud  
**License**: Open source (Islamic Network)

Provides:
- Full Quran text (Arabic)
- Verse-level data with surah:ayah mapping
- Translations (English, many others)
- Audio recitation URLs
- Word-level segmentation
- Tajweed data

**API Endpoints**:
```
GET https://api.alquran.cloud/v1/surah
GET https://api.alquran.cloud/v1/ayah/{surah}:{verse}
GET https://api.alquran.cloud/v1/surah/{number}
```

**Self-hosting**: Data can be downloaded and self-hosted. Islamic Network has moved repos to https://1x.ax (check for dataset downloads).

---

### Alternative: Quran.com API
**URL**: https://api.quran.com (v4)  
**Status**: Active, provides comprehensive data

Features:
- Uthmani script text
- 114 surahs complete
- Verse mappings (Juz, Hizb, page)
- Audio recitations
- 40+ translations

**Concern**: May require API key for high-volume usage. Check terms.

---

### Tanzil Dataset
**URL**: https://tanzil.net  
**License**: Open source (Publc Domain)

The gold standard for Quran text accuracy:
- Uthmani script text
- Word-level segmentation available
- XML/JSON formats
- Highly verified accuracy

**Download**: https://tanzil.net/download

**Integration**: Download JSON/text files and store in MinIO, serve via NestJS.

---

### EveryAyah.com
**URL**: https://everyayah.com  
**Features**:
- Quran text
- MP3 audio for every verse (by reciter)
- XML format
- Timings files

---

## 2. Transliteration Solutions

### Arabic Respell (npm: `arabic-respell`)
**npm**: https://www.npmjs.com/package/arabic-respell  
**License**: MIT

Features:
- Arabic to Roman (ISO 233-2)
- Word-level transliteration
- Handles Quranic Arabic
- Node.js compatible

### arabic-transliterate (npm)
**npm**: https://www.npmjs.com/package/arabic-transliteration  
**Features**: Character-level and word-level options

### Recommendation for Phase 3
Build a custom transliteration service using the `arabic-respell` algorithm:
- Store transliteration map in database
- Create `/quran/transliterate` endpoint in NestJS
- Map word-by-word or verse-by-verse
- Cache results in Redis

**Development Effort**: ~3-5 days

---

## 3. Audio Recitation Datasets

### MP3Quran.net
**URL**: https://www.mp3quran.net  
**Status**: Largest collection of reciters

**Top Reciters Available**:
- Mishary Alafasy (المصحف المرتل)
- Abdul Rahman Al-Sudais (عبد الرحمن السديس)
- Saud Al-Shuraim (سعود الشريم)
- Maher Al Muaiqly (ماهر المعيقلي)
- Many more (100+ reciters)

**Audio Format**: MP3, 128kbps/192kbps  
**Structure**: Per-surah and per-verse MP3 files available

**API Access**: Has an API (check https://www.mp3quran.net/ar/api)

### EveryAyah.com Audio
**URL**: https://everyayah.com  
**Recitations**: Multiple reciters including Mishary Alafasy

**URL Pattern** (per verse):
```
https://everyayah.com/data/{reciter_folder}/{surah:03}{verse:03}.mp3
```

Example: `https://everyayah.com/data/Alafasy_128kbps/001001.mp3` for Surah 1, Verse 1

### Quran.com CDN
**URL**: https://cdn.quran.com  
**Reciters**: Multiple popular reciters  
**Format**: OGG/MP3

**Integration**: Stream directly via URL or cache in MinIO

### Recommendation for Phase 3
1. **Primary**: Use EveryAyah.com URLs (free, reliable, verse-level)
2. **Backup**: MP3Quran.net for additional reciters
3. **Self-host**: Download recitations and store in MinIO (requires ~2GB per reciter)

**Audio URL Pattern**:
```
GET /quran/audio/{reciter}/{surah}:{verse}
→ Redirects to CDN URL or streams from MinIO
```

---

## 4. Translation APIs

### Al-Quran.cloud Translations
**Languages Available** (via API):
- English (Sahih International)
- Urdu (Farooq Keats)
- Indonesian
- French
- Spanish
- German
- And 30+ more

**Endpoint**:
```
GET https://api.alquran.cloud/v1/ayah/{surah}:{verse}/{translation}
```

### Quran.com Translations
**Coverage**: 40+ translations including:
- Sahih International (English)
- Pickthall (English)
- Yusuf Ali (English)
- Urdu, Indonesian, French, Spanish, etc.

---

### Open Translation Datasets

**Tanzil Translations**: https://tanzil.net/trans/  
- Multiple language translations available
- Plain text format, verse-level
- Public domain

**Recommended Approach**:
1. Use Al-Quran.cloud API for live translation lookup
2. Cache popular translations in MinIO/database
3. Store frequently used translations (English, Urdu, Indonesian, French) locally

**Development Effort**: ~3 days

---

## 5. Tajweed/Recitation Assessment

### Open-Source Options
**Status**: No mature open-source Tajweed assessment library exists

### Commercial/Research Options
1. **IBM Watson Tajweed** (research project, limited)
2. **Google Cloud Speech-to-Text for Arabic** - can compare recited audio to reference
3. **Custom ML Approach** - train on labeled Quran recitation dataset

### Feasibility Assessment

**Basic Tajweed (pronunciation rules)**:
- Complexity: HIGH
- Accuracy: Moderate
- Development Effort: 2-3 months for MVP

**Components Needed**:
1. Audio capture (browser Web Audio API)
2. Speech-to-text (Arabic) - could use Google Cloud Speech or Vosk (offline)
3. Phoneme matching algorithm
4. Tajweed rule engine

**Recommendation for Phase 3**:
- **Defer Tajweed assessment** to Phase 4+
- Focus on audio playback and verse highlighting first
- Note as "future enhancement" in docs

**For Live Classes**: Teacher can manually assess recitation using the verse-by-verse audio + text display.

---

## Recommendations Summary

### Phase 3 Implementation Stack

| Component | Source | Integration | Effort |
|-----------|--------|-------------|--------|
| Quran Text | Tanzil JSON | Store in MinIO, serve via API | 2 days |
| Transliteration | arabic-respell npm | NestJS service | 3-5 days |
| Audio Recitation | EveryAyah CDN | Proxy/redirect or MinIO | 2 days |
| Translations | Al-Quran.cloud API | Cache in Redis | 3 days |
| Verse Player UI | — | Next.js component | 5-7 days |

**Total Phase 3 Dev Effort**: ~15-20 days (3-4 weeks)

### Data Flow
```
1. Client requests /quran/verse/2:255
2. NestJS returns: { arabic, transliteration, translations[], audioUrl }
3. Client plays audio from audioUrl
4. Translation fetched from cache or API
```

### Blockers/Concerns
1. **Audio Storage**: Full recitations = ~2GB/reciter. Start with 1 reciter (Alafasy), add more on-demand.
2. **Rate Limits**: Al-Quran.cloud API may have limits. Cache aggressively.
3. **Offline Mode**: PWA can cache Quran text + 1 translation locally (IndexedDB).
4. **Tajweed**: No viable open-source solution. Consider ML approach post-launch.

### Self-Hosting Path
1. Download Tanzil Quran text (JSON) → MinIO
2. Download EveryAyah audio for Mishary Alafasy → MinIO
3. Deploy Al-Quran.cloud-compatible API or use their API
4. Cache translations in PostgreSQL per tenant
