import raw from "./quran.json";

export interface Ayah {
  number: number;
  text: string;
}

export interface Surah {
  id: number;
  name: string;
  englishName: string;
  revelationType: string;
  ayahsCount: number;
  ayahs: Ayah[];
}

interface QuranFile {
  surahs: Surah[];
}

const data = raw as QuranFile;

export const surahs: Surah[] = data.surahs;

export const getSurahById = (id: number): Surah | undefined =>
  surahs.find((s) => s.id === id);

export const getNextSurah = (id: number): Surah | undefined => {
  const idx = surahs.findIndex((s) => s.id === id);
  if (idx === -1 || idx >= surahs.length - 1) return undefined;
  return surahs[idx + 1];
};
