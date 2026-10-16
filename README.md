# Pinkie Days ♡

A cozy kawaii habit tracker + to-do list for Android.

## Pinkie Days 1.2.0
- Bottom navigation: Today, Habits, Tasks, Play, Style
- Todoist-like task sections: Inbox, Personal, Work, plus custom sections
- TikTok-style daily streak flame with a 7-day activity strip
- Six accent palettes: rose, lavender, sky, mint, peach, cherry
- Adjustable block opacity so background stickers can show through
- Sticker Manager: show/hide, resize, rotate, delete, random sticker, hide all
- Habit tracker with date-based streak history
- ADHD-friendly focus picker, focus-only view, brain dump, and 5-minute sprint
- Five mini-games with motivational rewards
- 100 motivational quote combinations localized in 7 languages
- English, Russian, Kyrgyz, Kazakh, Uzbek, Tajik, Turkish
- Pink, dark, and scary-cute Halloween themes
- JSON import/export backup
- Random veterinary-care donation-page picker; it never sends money automatically
- Pinkie/Mochi bunny app icon

## Android build
GitHub Actions builds `PinkieDays-1.2.0.apk` on every push to `main` and publishes it as the `PinkieDays-APK` workflow artifact.

## Local build
Requires Android SDK 35, Java 21, and Gradle 8.10.2.

```bash
gradle :app:assembleDebug
```
