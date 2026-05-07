"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Search } from "lucide-react";

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: "Meccan" | "Medinan";
}

interface SurahListProps {
  surahs: Surah[];
  selectedSurah: number;
  onSelectSurah: (num: number) => void;
  currentVerse?: number;
  lastRead?: { surah: number; verse: number };
}

const MOCK_SURAHS: Surah[] = [
  { number: 1, name: "الفاتحة", englishName: "Al-Fatihah", englishNameTranslation: "The Opening", numberOfAyahs: 7, revelationType: "Meccan" },
  { number: 2, name: "البقرة", englishName: "Al-Baqarah", englishNameTranslation: "The Cow", numberOfAyahs: 286, revelationType: "Medinan" },
  { number: 3, name: "آل عمران", englishName: "Ali 'Imran", englishNameTranslation: "The Family of Imran", numberOfAyahs: 200, revelationType: "Medinan" },
  { number: 4, name: "النساء", englishName: "An-Nisa", englishNameTranslation: "The Women", numberOfAyahs: 176, revelationType: "Medinan" },
  { number: 5, name: "المائدة", englishName: "Al-Ma'idah", englishNameTranslation: "The Table Spread", numberOfAyahs: 120, revelationType: "Medinan" },
  { number: 6, name: "الأنعام", englishName: "Al-An'am", englishNameTranslation: "The Cattle", numberOfAyahs: 165, revelationType: "Meccan" },
  { number: 7, name: "الأعراف", englishName: "Al-A'raf", englishNameTranslation: "The Heights", numberOfAyahs: 206, revelationType: "Meccan" },
  { number: 36, name: "يس", englishName: "Ya-Sin", englishNameTranslation: "Ya Sin", numberOfAyahs: 83, revelationType: "Meccan" },
  { number: 55, name: "الرحمن", englishName: "Ar-Rahman", englishNameTranslation: "The Beneficent", numberOfAyahs: 78, revelationType: "Medinan" },
  { number: 67, name: "الملك", englishName: "Al-Mulk", englishNameTranslation: "The Sovereignty", numberOfAyahs: 30, revelationType: "Meccan" },
  { number: 112, name: "الإخلاص", englishName: "Al-Ikhlas", englishNameTranslation: "The Sincerity", numberOfAyahs: 5, revelationType: "Meccan" },
  { number: 114, name: "الناس", englishName: "An-Nas", englishNameTranslation: "Mankind", numberOfAyahs: 6, revelationType: "Meccan" },
];

export function SurahList({ surahs, selectedSurah, onSelectSurah, currentVerse, lastRead }: SurahListProps) {
  const [search, setSearch] = React.useState("");
  const listRef = React.useRef<HTMLDivElement>(null);

  const filteredSurahs = surahs.filter(
    (surah) =>
      surah.number.toString().includes(search) ||
      surah.englishName.toLowerCase().includes(search.toLowerCase()) ||
      surah.name.includes(search)
  );

  React.useEffect(() => {
    if (selectedSurah && listRef.current) {
      const element = listRef.current.querySelector(`[data-surah="${selectedSurah}"]`);
      element?.scrollIntoView({ block: "center" });
    }
  }, [selectedSurah]);

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      <div className="p-3 border-b border-slate-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search surahs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 bg-slate-50 border-slate-200"
          />
        </div>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto">
        {filteredSurahs.map((surah) => {
          const isSelected = surah.number === selectedSurah;
          const isLastRead = lastRead?.surah === surah.number;

          return (
            <button
              key={surah.number}
              data-surah={surah.number}
              onClick={() => onSelectSurah(surah.number)}
              className={cn(
                "w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors text-right border-b border-slate-100",
                isSelected && "bg-primary/5 border-l-4 border-l-primary",
                isLastRead && "bg-accent/5"
              )}
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-medium text-slate-600">
                {surah.number}
              </div>
              <div className="flex-1 min-w-0 text-right">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-arabic text-lg text-slate-900">{surah.name}</span>
                  {isLastRead && (
                    <Badge variant="accent" className="text-xs">Last Read</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <span className="text-xs text-slate-500">{surah.englishNameTranslation}</span>
                  <span className="text-xs text-slate-400">{surah.numberOfAyahs} verses</span>
                </div>
              </div>
              <Badge variant={surah.revelationType === "Meccan" ? "secondary" : "default"} className="text-xs">
                {surah.revelationType === "Meccan" ? "Meccan" : "Medinan"}
              </Badge>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { MOCK_SURAHS };
