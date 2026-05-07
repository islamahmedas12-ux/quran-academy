"use client";

import * as React from "react";
import { SurahList, MOCK_SURAHS } from "@/components/quran/SurahList";
import { VerseDisplay } from "@/components/quran/VerseDisplay";
import { AudioPlayer } from "@/components/quran/AudioPlayer";
import { ClassBookingModal } from "@/components/quran/ClassBookingModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  Minus,
  Plus,
  Languages,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

interface QuranVerse {
  id: string;
  surah: number;
  verse: number;
  text: string;
  transliteration: string;
  translation: string;
  audioUrl: string;
}

const MOCK_VERSES: Record<number, QuranVerse[]> = {
  1: [
    {
      id: "1:1",
      surah: 1,
      verse: 1,
      text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      transliteration: "Bismi Allāhi Ar-Raḥmāni Ar-Raḥīmi",
      translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
      audioUrl: "https://everyayah.com/data/Alafasy_128kbps/001001.mp3",
    },
    {
      id: "1:2",
      surah: 1,
      verse: 2,
      text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
      transliteration: "Al-Ḥamdu lillāhi Rabbil-ʿālamīna",
      translation: "[All] praise is [due] to Allah, Lord of all the worlds.",
      audioUrl: "https://everyayah.com/data/Alafasy_128kbps/001002.mp3",
    },
    {
      id: "1:3",
      surah: 1,
      verse: 3,
      text: "الرَّحْمَٰنِ الدُّنِيَا وَالْآخِرَةِ وَرَحِيمِ",
      transliteration: "Ar-Raḥmānid-Dānyā wal-Ākhirati wa Raḥīmi",
      translation: "The Entirely Merciful, the Especially Merciful, Sovereign of the Day of Judgment.",
      audioUrl: "https://everyayah.com/data/Alafasy_128kbps/001003.mp3",
    },
    {
      id: "1:4",
      surah: 1,
      verse: 4,
      text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
      transliteration: "Iyyāka Naʿbudu wa Iyyāka Nastaʿīnu",
      translation: "You alone we worship and You alone we ask for help.",
      audioUrl: "https://everyayah.com/data/Alafasy_128kbps/001004.mp3",
    },
    {
      id: "1:5",
      surah: 1,
      verse: 5,
      text: "إِهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
      transliteration: "Ihdinas-Ṣirāṭal-Mustaqīmi",
      translation: "Guide us to the straight path.",
      audioUrl: "https://everyayah.com/data/Alafasy_128kbps/001005.mp3",
    },
    {
      id: "1:6",
      surah: 1,
      verse: 6,
      text: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
      transliteration: "Ṣirāṭal-Ladhīna Anʿamta ʿAlayhim Ghayril-Maghḍūbi ʿAlayhim wa Lāḍ-Ḍāllīna",
      translation: "The path of those upon whom You have bestowed favor, not of those who have earned wrath or of those who are astray.",
      audioUrl: "https://everyayah.com/data/Alafasy_128kbps/001006.mp3",
    },
    {
      id: "1:7",
      surah: 1,
      verse: 7,
      text: "آمِينَ",
      transliteration: "Āmīna",
      translation: "Amen.",
      audioUrl: "https://everyayah.com/data/Alafasy_128kbps/001007.mp3",
    },
  ],
  112: [
    {
      id: "112:1",
      surah: 112,
      verse: 1,
      text: "قُلْ هُوَ اللَّهُ أَحَدٌ",
      transliteration: "Qul Huwa Allāhu Aḥad",
      translation: "Say, \"He is Allah, [who is] One.",
      audioUrl: "https://everyayah.com/data/Alafasy_128kbps/112001.mp3",
    },
    {
      id: "112:2",
      surah: 112,
      verse: 2,
      text: "اللَّهُ الصَّمَدُ",
      transliteration: "Allāhu Aṣ-Ṣamad",
      translation: "Allah, the Eternal Refuge.",
      audioUrl: "https://everyayah.com/data/Alafasy_128kbps/112002.mp3",
    },
    {
      id: "112:3",
      surah: 112,
      verse: 3,
      text: "لَمْ يَلِدْ وَلَمْ يُولَدْ",
      transliteration: "Lam Yalid wa Lam Yūlad",
      translation: "He neither begets nor is born.",
      audioUrl: "https://everyayah.com/data/Alafasy_128kbps/112003.mp3",
    },
    {
      id: "112:4",
      surah: 112,
      verse: 4,
      text: "وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ",
      transliteration: "Wa Lam Yakun Lahu Kufuwan Aḥad",
      translation: "Nor is there to Him any equivalent.\"",
      audioUrl: "https://everyayah.com/data/Alafasy_128kbps/112004.mp3",
    },
  ],
};

const MOCK_TEACHERS = [
  {
    id: "1",
    name: "Sheikh Ahmad Al-Mahdi",
    avatar: null,
    bio: "Expert in Tajweed and Hifz with over 15 years of teaching experience. Specializes in helping students master proper recitation.",
    specialization: ["Tajweed", "Hifz", "Qira'at"],
    rating: 4.9,
    totalClasses: 248,
  },
  {
    id: "2",
    name: "Sheikh Mohammed Salim",
    avatar: null,
    bio: "Graduated from Al-Azhar University. Passionate about teaching Quranic Arabic and building strong foundations for beginners.",
    specialization: ["Arabic Grammar", "Beginners", "Tafseer"],
    rating: 4.7,
    totalClasses: 156,
  },
  {
    id: "3",
    name: "Sheikh Abdullah Yusuf",
    avatar: null,
    bio: "Specializes in classical recitation styles and is certified in multiple Qira'at. Great for advanced students.",
    specialization: ["Qira'at", "Advanced Tajweed", "Classical Recitation"],
    rating: 4.8,
    totalClasses: 189,
  },
];

const TRANSLATION_LANGUAGES = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "ur", name: "Urdu", flag: "🇵🇰" },
  { code: "id", name: "Indonesian", flag: "🇮🇩" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "de", name: "German", flag: "🇩🇪" },
];

export default function QuranReaderPage() {
  const [selectedSurah, setSelectedSurah] = React.useState(1);
  const [verses, setVerses] = React.useState<QuranVerse[]>([]);
  const [currentVerse, setCurrentVerse] = React.useState<number | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [showTranslation, setShowTranslation] = React.useState(false);
  const [translationLanguage, setTranslationLanguage] = React.useState("en");
  const [fontSize, setFontSize] = React.useState<"sm" | "md" | "lg" | "xl">("lg");
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [reciter, setReciter] = React.useState("alafasy");
  const [bookingModalOpen, setBookingModalOpen] = React.useState(false);
  const [selectedVerseForBooking, setSelectedVerseForBooking] = React.useState<QuranVerse | null>(null);
  const [lastRead, setLastRead] = React.useState({ surah: 1, verse: 1 });

  React.useEffect(() => {
    const mockVerses = MOCK_VERSES[selectedSurah] || MOCK_VERSES[1];
    setVerses(mockVerses);
    setCurrentVerse(null);
    setIsPlaying(false);
  }, [selectedSurah]);

  const handlePlayAudio = (verse: QuranVerse) => {
    if (currentVerse === verse.verse && isPlaying) {
      setIsPlaying(false);
    } else {
      setCurrentVerse(verse.verse);
      setIsPlaying(true);
      setLastRead({ surah: verse.surah, verse: verse.verse });
      const audio = new Audio(verse.audioUrl);
      audio.play().catch(console.error);
      audio.onended = () => setIsPlaying(false);
    }
  };

  const handlePrevious = () => {
    if (currentVerse && currentVerse > 1) {
      const prevVerse = verses.find((v) => v.verse === currentVerse - 1);
      if (prevVerse) handlePlayAudio(prevVerse);
    }
  };

  const handleNext = () => {
    if (currentVerse && currentVerse < verses.length) {
      const nextVerse = verses.find((v) => v.verse === currentVerse + 1);
      if (nextVerse) handlePlayAudio(nextVerse);
    }
  };

  const handleBookClass = (verse: QuranVerse) => {
    setSelectedVerseForBooking(verse);
    setBookingModalOpen(true);
  };

  const handleBookingConfirm = async (teacherId: string, slotId: string, topic: string) => {
    console.log("Booking:", { teacherId, slotId, topic, verse: selectedVerseForBooking });
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const currentSurah = MOCK_SURAHS.find((s) => s.number === selectedSurah);

  return (
    <div className="h-[calc(100vh-64px)] flex bg-slate-50">
      <div className="flex-shrink-0 w-72 hidden lg:block">
        <SurahList
          surahs={MOCK_SURAHS}
          selectedSurah={selectedSurah}
          onSelectSurah={setSelectedSurah}
          currentVerse={currentVerse || undefined}
          lastRead={lastRead}
        />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-72 bg-white">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-semibold">Surahs</span>
              <button onClick={() => setSidebarOpen(false)} className="p-2">
                <X className="h-5 w-5" />
              </button>
            </div>
            <SurahList
              surahs={MOCK_SURAHS}
              selectedSurah={selectedSurah}
              onSelectSurah={(num) => { setSelectedSurah(num); setSidebarOpen(false); }}
              currentVerse={currentVerse || undefined}
              lastRead={lastRead}
            />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <h1 className="font-semibold text-slate-900">
                  {currentSurah?.englishName} - {currentSurah?.name}
                </h1>
                <p className="text-sm text-slate-500">
                  {currentSurah?.numberOfAyahs} verses • {currentSurah?.revelationType}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 border border-slate-200 rounded-lg">
                <button
                  onClick={() => setFontSize("sm")}
                  className="p-1.5 hover:bg-slate-100 rounded-l-lg"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-2 text-sm font-medium">{fontSize.toUpperCase()}</span>
                <button
                  onClick={() => setFontSize("xl")}
                  className="p-1.5 hover:bg-slate-100 rounded-r-lg"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={() => setShowTranslation(!showTranslation)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                  showTranslation
                    ? "bg-primary text-white border-primary"
                    : "border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Languages className="h-4 w-4" />
                {TRANSLATION_LANGUAGES.find((l) => l.code === translationLanguage)?.name || "Translation"}
              </button>

              {showTranslation && (
                <select
                  value={translationLanguage}
                  onChange={(e) => setTranslationLanguage(e.target.value)}
                  className="text-sm border border-slate-200 rounded-lg px-2 py-1.5"
                >
                  {TRANSLATION_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {verses.map((verse) => (
              <VerseDisplay
                key={verse.id}
                verse={verse}
                isPlaying={isPlaying}
                isCurrentVerse={currentVerse === verse.verse}
                showTranslation={showTranslation}
                translationLanguage={translationLanguage}
                fontSize={fontSize}
                onPlayAudio={handlePlayAudio}
                onBookClass={handleBookClass}
              />
            ))}
          </div>
        </main>
      </div>

      <AudioPlayer
        currentVerse={currentVerse ? { surah: selectedSurah, verse: currentVerse } : null}
        isPlaying={isPlaying}
        reciter={reciter}
        onReciterChange={setReciter}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />

      <ClassBookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        teachers={MOCK_TEACHERS}
        onBookClass={handleBookingConfirm}
      />
    </div>
  );
}
