import prayerMat from '@/assets/catalog/prayer-mat.jpg';
import tasbeeh from '@/assets/catalog/tasbeeh.jpg';
import attar from '@/assets/catalog/attar.jpg';
import prayerDress from '@/assets/catalog/prayer-dress.jpg';
import ihram from '@/assets/catalog/ihram.jpg';
import quran from '@/assets/catalog/quran.jpg';
import gifts from '@/assets/catalog/gift-box.jpg';
import redMat from '@/assets/catalog/prayer-mat-red.jpg';
import prayerHero from '@/assets/prayer-hero.jpg';
import giftsHero from '@/assets/gifts-hero.jpg';
import ihramHero from '@/assets/ihram-hero.jpg';
const images: Record<string, string> = { 'prayer-mat': prayerMat, tasbeeh, attar, 'prayer-dress': prayerDress, ihram, quran, 'gift-box': gifts, 'prayer-mat-red': redMat, 'prayer-hero': prayerHero, 'gifts-hero': giftsHero, 'ihram-hero': ihramHero };
export function catalogImage(value: string) { return value.startsWith('catalog:') ? images[value.slice(8)] ?? prayerMat : value; }
