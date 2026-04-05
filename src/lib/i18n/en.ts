export const en = {
  // Navigation & Shared
  settings: 'Settings',
  back: 'Back',
  general: 'General',
  location: 'Location',
  calculation: 'Calculation',
  prayerTimes: 'Prayer Times',
  notifications: 'Notifications',
  language: 'Language',

  // Prayer names
  fajr: 'Fajr',
  sunrise: 'Sunrise',
  afterSunrise: 'after sunrise',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',

  // Main page
  nextPrayer: 'Next Prayer',
  remainingUntil: 'Remaining until',
  today: 'Today',
  locationLabel: 'Location',
  calendar: 'Calendar',

  // Settings tabs
  enterCityOrAddress: 'Enter a city or address...',
  submit: 'Submit',
  selectedLocation: 'Selected Location:',
  coordinates: 'Coordinates:',
  autostartAtSystemStartup: 'Autostart at system startup',
  darkMode: 'Dark Mode',
  appVersion: 'App Version',

  // Calculation
  calculationMethod: 'Calculation Method',
  midnightMethod: 'Midnight Method',
  higherLatitudesAdjustment: 'Higher Latitudes Adjustment',
  degrees: 'degrees',
  minutes: 'minutes',

  // Prayer times
  showPrayerTimes: 'Show Prayer Times',
  playAdzanAt: 'Play Adzan At',
  timeFormat: 'Time Format',
  hour12: '12 Hour',
  hour24: '24 Hour',

  // Notifications
  notificationBeforePrayerTime: 'Notification before prayer time',
  enableNotifications: 'Enable notifications',

  // Language
  selectLanguage: 'Select Language',
  english: 'English',
  arabic: 'العربية',

  // Calendar
  prayerCalendar: 'Prayer Calendar',
  date: 'Date',

  // Onboarding
  welcome: 'Welcome to Praydo',
  letsGetYouSetup: "Let's get you set up in a few quick steps.",
  setYourLocation: 'Set Your Location',
  searchForCity: 'Search for your city to get accurate prayer times.',
  enterCityPlaceholder: 'Enter a city (e.g., Jakarta, London...)',
  searching: 'Searching...',
  search: 'Search',
  noLocationsFound: 'No locations found. Please try another search.',
  errorFetchingLocation:
    'Error fetching location. Please check your connection.',
  selectedLocationLabel: 'Selected Location',
  step1SetLocation: 'Step 1: Set Your Location',
  step2CalculationMethod: 'Step 2: Calculation Method',
  step3Notifications: 'Step 3: Notifications',
  selectMethodInRegion: 'Select the method used in your region.',
  calculationMethodLabel: 'Calculation Method',
  tipKeepDefault:
    "Tip: If you're not sure, you can keep the default or change it later in Settings.",
  enableAlerts: 'Enable alerts so you never miss a prayer.',
  enableAllPrayerAlerts: 'Enable all prayer alerts',
  next: 'Next',
  finish: 'Finish',

  // Settings - Calculation panel
  fajrAngle: 'Fajr Angle',
  enterDegreesValue: 'Enter the value of degrees',
  enterValueAfterSunset: 'Enter the value of minutes after sunset',
  ishaLabel: 'Isha',
  enterValueAfterMaghrib: 'Enter the value of minutes after maghrib',
  enterMinutesAfterMidday: 'Enter the value of minutes after mid-day',
  higherLatitudes: 'Higher Latitudes',
  midnight: 'Midnight',

  // Settings - Prayer panel
  uploadAzanSound: 'Upload Azan Sound',
  addAudioFile:
    'Add an MP3, WAV, OGG, or M4A file. It will appear in the sound menu below after upload.',
  uploading: 'Uploading sound file...',
  azanSound: 'azan sound',

  // Settings - Alert panel
  notificationBeforePrayer: 'Notification before prayer time',

  // Toaster messages
  noLocationsFoundToast: 'No locations found',
  errorFetchingLocationToast: 'Error fetching location',
  autostartEnabled: 'Autostart Enabled',
  autostartDisabled: 'Autostart Disabled',
  failedToUpdateAutostart: 'Failed to update autostart setting',
  soundUploaded: 'Sound uploaded',
  soundReady: 'is ready to use.',
  failedToUploadSound: 'Failed to upload sound file',
  pleaseTryAgain: 'Please try again.',

  // OpenStreetMap
  locationDataProvidedBy: 'Location data provided by',
} as const;

export type TranslationKey = keyof typeof en;
