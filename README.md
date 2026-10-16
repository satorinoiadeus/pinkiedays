# Pinkie Days ♡

A cozy kawaii habit tracker + to-do list for Android.

## Included
- Habit tracker with real date-based streak history
- To-do list + quick brain dump
- ADHD-friendly “Focus now” picker, focus-only view, and 5-minute sprint
- Draggable kawaii background stickers
- Five mini-games: Bunny Tap, Star Catch, Memory Pairs, Bubble Pop, Kawaii Sequence
- 100 motivational quote combinations localized in 7 languages
- English, Russian, Kyrgyz, Kazakh, Uzbek, Tajik, Turkish
- Pink, dark, and scary-cute Halloween themes
- Reduced-motion accessibility option
- JSON import/export backup
- Random verified veterinary-care donation-page picker; it never sends money automatically
- Pinkie/Mochi bunny app icon

## Android build
GitHub Actions builds `PinkieDays-1.1.0.apk` on every push to `main` and publishes it as the `PinkieDays-APK` workflow artifact.

## Local build
Requires Android SDK 35, Java 21, and Gradle 8.10.2.

```bash
gradle :app:assembleDebug
```
