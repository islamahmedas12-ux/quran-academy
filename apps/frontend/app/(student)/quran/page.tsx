"use client";

import * as React from "react";
import { Menu, X, Settings, ChevronLeft, Moon, Sun, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SurahList } from "@/components/quran/SurahList";
import { VerseDisplay } from "@/components/quran/VerseDisplay";
import { AudioPlayer } from "@/components/quran/AudioPlayer";
import { ClassBookingModal } from "@/components/quran/ClassBookingModal";
import { Card } from "@/components/ui/card";
import type { Surah, QuranVerse, Teacher } from "@/lib/types";

const MOCK_SURAHS: Surah[] = [
  { number: 1, name: "Al-Fatiha", englishName: "Al-Fatiha", englishNameTranslation: "The Opening", numberOfAyahs: 7, revelationType: "Meccan" },
  { number: 2, name: "Al-Baqara", englishName: "Al-Baqara", englishNameTranslation: "The Cow", numberOfAyahs: 286, revelationType: "Medinan" },
  { number: 3, name: "Ali Imran", englishName: "Ali Imran", englishNameTranslation: "Family of Imran", numberOfAyahs: 200, revelationType: "Medinan" },
  { number: 4, name: "An-Nisa", englishName: "An-Nisa", englishNameTranslation: "The Women", numberOfAyahs: 176, revelationType: "Medinan" },
  { number: 5, name: "Al-Ma'ida", englishName: "Al-Ma'ida", englishNameTranslation: "The Table Spread", numberOfAyahs: 120, revelationType: "Medinan" },
  { number: 6, name: "Al-An'am", englishName: "Al-An'am", englishNameTranslation: "The Cattle", numberOfAyahs: 165, revelationType: "Meccan" },
  { number: 7, name: "Al-A'raf", englishName: "Al-A'raf", englishNameTranslation: "The Heights", numberOfAyahs: 206, revelationType: "Meccan" },
  { number: 36, name: "Ya-Sin", englishName: "Ya-Sin", englishNameTranslation: "Ya Sin", numberOfAyahs: 83, revelationType: "Meccan" },
  { number: 55, name: "Ar-Rahman", englishName: "Ar-Rahman", englishNameTranslation: "The Beneficent", numberOfAyahs: 78, revelationType: "Medinan" },
  { number: 67, name: "Al-Mulk", englishName: "Al-Mulk", englishNameTranslation: "The Sovereignty", numberOfAyahs: 30, revelationType: "Meccan" },
  { number: 112, name: "Al-Ikhlas", englishName: "Al-Ikhlas", englishNameTranslation: "The Sincerity", numberOfAyahs: 4, revelationType: "Meccan" },
  { number: 114, name: "An-Nas", englishName: "An-Nas", englishNameTranslation: "Mankind", numberOfAyahs: 6, revelationType: "Meccan" },
];

const MOCK_VERSES: QuranVerse[] = [
  { id: "1-1", surah: 1, verse: 1, text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", transliteration: "Bismi Allāhi Ar-Raḥmāni Ar-Raḥīm", translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful.", audioUrl: "/audio/1-1.mp3" },
  { id: "1-2", surah: 1, verse: 2, text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", transliteration: "Al-Ḥamdu lillāhi Rabbil-ʿālamīn", translation: "[All] praise is [due] to Allah, Lord of the worlds -", audioUrl: "/audio/1-2.mp3" },
  { id: "1-3", surah: 1, verse: 3, text: "الرَّحْمَٰنِ الرَّحِيمِ", transliteration: "Ar-Raḥmāni Ar-Raḥīm", translation: "The Entirely Merciful, the Especially Merciful,", audioUrl: "/audio/1-3.mp3" },
  { id: "1-4", surah: 1, verse: 4, text: "مَالِكِ يَوْمِ الدِّينِ", transliteration: "Māliki yawmi Ad-dīn", translation: "Sovereign of the Day of Recompense.", audioUrl: "/audio/1-4.mp3" },
  { id: "1-5", surah: 1, verse: 5, text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", transliteration: "Iyyāka naʿbudu wa iyyāka nastaʿīn", translation: "It is You we worship and You we ask for help.", audioUrl: "/audio/1-5.mp3" },
  { id: "1-6", surah: 1, verse: 6, text: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", transliteration: "Ihdinā Aṣ-ṣirāṭa Al-Mustaqīm", translation: "Guide us to the straight path -", audioUrl: "/audio/1-6.mp3" },
  { id: "1-7", surah: 1, verse: 7, text: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ", transliteration: "Ṣirāṭa Al-ladhīna anʿamta ʿalayhim ghayri Al-maghḍūbi ʿalayhim wa lā Aḍ-ḍāllīn", translation: "The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.", audioUrl: "/audio/1-7.mp3" },
];

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ur", label: "Urdu" },
  { code: "id", label: "Indonesian" },
  { code: "fr", label: "French" },
  { code: "es", label: "Spanish" },
];

export default function QuranReaderPage() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [selectedSurah, setSelectedSurah] = React.useState(1);
  const [verses, setVerses] = React.useState<QuranVerse[]>([]);
  const [isLoadingVerses, setIsLoadingVerses] = React.useState(false);
  const [fontSize, setFontSize] = React.useState(28);
  const [translationLang, setTranslationLang] = React.useState("en");
  const [playingVerseId, setPlayingVerseId] = React.useState<string | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [bookingModalOpen, setBookingModalOpen] = React.useState(false);
  const [selectedVerse, setSelectedVerse] = React.useState<QuranVerse | null>(null);
  const [selectedTeacher, setSelectedTeacher] = React.useState<Teacher | null>(null);
  const [darkMode, setDarkMode] = React.useState(false);

  React.useEffect(() => {
    setIsLoadingVerses(true);
    const timer = setTimeout(() => {
      setVerses(MOCK_VERSES.filter((v) => v.surah === selectedSurah));
      setIsLoadingVerses(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedSurah, translationLang]);

  const handleSelectSurah = (number: number) => {
    setSelectedSurah(number);
    setSidebarOpen(false);
    setPlayingVerseId(null);
    setIsPlaying(false);
  };

  const handlePlayVerse = (audioUrl: string, verseId: string) => {
    setPlayingVerseId(verseId);
    setIsPlaying(true);
  };

  const handleBookClass = (verse: QuranVerse) => {
    setSelectedVerse(verse);
    setSelectedTeacher({
      id: "teacher_1", userId: "user_1", name: "Sheikh Ibrahim", email: "ibrahim@quranacademy.com",
      avatar: null, bio: "Experienced Quran teacher specializing in Tajweed and Memorization.",
      specialization: ["Tajweed", "Hifz", "Tafsir"], availability: [], rating: 4.8, totalClasses: 156,
    });
    setBookingModalOpen(true);
  };

  const handleBookingConfirm = (notes: string) => {
    console.log("Booking confirmed:", { teacher: selectedTeacher, verse: selectedVerse, notes });
    setBookingModalOpen(false);
  };

  const selectedSurahData = MOCK_SURAHS.find((s) => s.number === selectedSurah);

  return (
    <div className={cn("min-h-screen transition-colors duration-300", darkMode ? "bg-slate-900" : "bg-slate-50")}>
      {/* Mobile header */}
      <header className={cn("md:hidden sticky top-0 z-40 border-b px-4 py-3 transition-colors duration-300", darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200")}>
        <div className="flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-slate-100">
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="font-semibold">{selectedSurahData?.englishName || "Quran Reader"}</h1>
          <div className="flex items-center gap-1">
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg hover:bg-slate-100">
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button className="p-2 rounded-lg hover:bg-slate-100">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">QA</span>
                </div>
                <span className="font-semibold">Surah List</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto h-[calc(100%-64px)]">
              <SurahList surahs={MOCK_SURAHS} selectedSurah={selectedSurah} onSelectSurah={handleSelectSurah} isLoading={false} />
            </div>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className={cn("hidden md:block w-72 border-r h-[calc(100vh-64px)] sticky top-0 overflow-y-auto transition-colors duration-300", darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200")}>
          <div className="p-4 border-b">
            <h2 className="font-semibold text-lg">Surah List</h2>
          </div>
          <SurahList surahs={MOCK_SURAHS} selectedSurah={selectedSurah} onSelectSurah={handleSelectSurah} isLoading={false} />
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 pb-24">
          {/* Controls */}
          <Card className={cn("mb-6 transition-colors duration-300", darkMode && "bg-slate-800 border-slate-700")}>
            <div className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">Font Size:</span>
                  <Button variant="outline" size="sm" onClick={() => setFontSize((s) => Math.max(16, s - 2))} className="w-8 h-8 p-0">A-</Button>
                  <span className="text-sm font-medium w-8 text-center">{fontSize}</span>
                  <Button variant="outline" size="sm" onClick={() => setFontSize((s) => Math.min(48, s + 2))} className="w-8 h-8 p-0">A+</Button>
                </div>
                <div className="h-6 w-px bg-slate-200 hidden sm:block" />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">Translation:</span>
                  <select
                    value={translationLang}
                    onChange={(e) => setTranslationLang(e.target.value)}
                    className={cn("px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors", darkMode ? "bg-slate-700 border-slate-600 text-white" : "border-slate-200 bg-white")}
                  >
                    {LANGUAGES.map((lang) => (<option key={lang.code} value={lang.code}>{lang.label}</option>))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setDarkMode(!darkMode)}>
                  {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </Card>

          {/* Surah header */}
          <div className="mb-8 text-center animate-fade-in">
            <div className={cn("inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm mb-3", darkMode ? "bg-slate-800 text-slate-300" : "bg-primary/10 text-primary")}>
              <span>{selectedSurahData?.revelationType}</span>
              <span>·</span>
              <span>{selectedSurahData?.numberOfAyahs} verses</span>
            </div>
            <h1 className={cn("text-3xl font-bold mb-2", darkMode && "text-white")}>{selectedSurahData?.englishName}</h1>
            <p className={cn("text-slate-500", darkMode && "text-slate-400")}>{selectedSurahData?.englishNameTranslation}</p>
            <div className="mt-4 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          </div>

          {/* Verses */}
          {isLoadingVerses ? (
            <div className="space-y-4">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className={cn("p-6 rounded-2xl border animate-pulse", darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200")}>
                  <div className="h-32 bg-slate-200 rounded-xl" />
                </div>
              ))}
            </div>
          ) : (
            <VerseDisplay
              verses={verses}
              fontSize={fontSize}
              translationLang={translationLang}
              onPlayVerse={handlePlayVerse}
              onBookClass={handleBookClass}
              playingVerseId={playingVerseId}
              isPlaying={isPlaying}
              darkMode={darkMode}
            />
          )}
        </main>
      </div>

      {/* Audio player */}
      {playingVerseId && (
        <AudioPlayer
          audioUrl={verses.find((v) => v.id === playingVerseId)?.audioUrl || null}
          currentVerseId={playingVerseId}
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* Booking modal */}
      <ClassBookingModal isOpen={bookingModalOpen} onClose={() => setBookingModalOpen(false)} teacher={selectedTeacher} selectedVerse={selectedVerse?.text} onConfirm={handleBookingConfirm} />
    </div>
  );
}
