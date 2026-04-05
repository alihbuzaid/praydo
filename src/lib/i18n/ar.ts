export const ar = {
  // Navigation & Shared
  settings: 'الإعدادات',
  back: 'رجوع',
  general: 'عام',
  location: 'الموقع',
  calculation: 'الحساب',
  prayerTimes: 'أوقات الصلاة',
  notifications: 'الإشعارات',
  language: 'اللغة',

  // Prayer names
  fajr: 'الفجر',
  sunrise: 'الشروق',
  afterSunrise: 'بعد الشروق',
  dhuhr: 'الظهر',
  asr: 'العصر',
  maghrib: 'المغرب',
  isha: 'العشاء',

  // Main page
  nextPrayer: 'الصلاة التالية',
  remainingUntil: 'متبقي حتى',
  today: 'اليوم',
  locationLabel: 'الموقع',
  calendar: 'التقويم',

  // Settings tabs
  enterCityOrAddress: 'أدخل مدينة أو عنوان...',
  submit: 'إرسال',
  selectedLocation: 'الموقع المحدد:',
  coordinates: 'الإحداثيات:',
  autostartAtSystemStartup: 'بدء التشغيل التلقائي عند بدء النظام',
  darkMode: 'الوضع الداكن',
  appVersion: 'إصدار التطبيق',

  // Calculation
  calculationMethod: 'طريقة الحساب',
  midnightMethod: 'طريقة منتصف الليل',
  higherLatitudesAdjustment: 'ضبط العرض العالي',
  degrees: 'درجات',
  minutes: 'دقائق',

  // Prayer times
  showPrayerTimes: 'عرض أوقات الصلاة',
  playAdzanAt: 'تشغيل الأذان عند',
  timeFormat: 'تنسيق الوقت',
  hour12: '12 ساعة',
  hour24: '24 ساعة',

  // Notifications
  notificationBeforePrayerTime: 'إشعار قبل وقت الصلاة',
  enableNotifications: 'تفعيل الإشعارات',

  // Language
  selectLanguage: 'اختر اللغة',
  english: 'English',
  arabic: 'العربية',

  // Calendar
  prayerCalendar: 'تقويم الصلاة',
  date: 'التاريخ',

  // Onboarding
  welcome: 'مرحباً بك في Praydo',
  letsGetYouSetup: 'دعنا نجهزك في بضع خطوات سريعة.',
  setYourLocation: 'حدد موقعك',
  searchForCity: 'ابحث عن مدينتك للحصول على أوقات صلاة دقيقة.',
  enterCityPlaceholder: 'أدخل مدينة (مثل: جاكرتا، لندن...)',
  searching: 'جارٍ البحث...',
  search: 'بحث',
  noLocationsFound: 'لم يتم العثور على مواقع. يرجى المحاولة مرة أخرى.',
  errorFetchingLocation: 'خطأ في جلب الموقع. يرجى التحقق من اتصالك.',
  selectedLocationLabel: 'الموقع المحدد',
  step1SetLocation: 'الخطوة 1: حدد موقعك',
  step2CalculationMethod: 'الخطوة 2: طريقة الحساب',
  step3Notifications: 'الخطوة 3: الإشعارات',
  selectMethodInRegion: 'اختر الطريقة المستخدمة في منطقتك.',
  calculationMethodLabel: 'طريقة الحساب',
  tipKeepDefault:
    'نصيحة: إذا لم تكن متأكداً، يمكنك الاحتفاظ بالإعداد الافتراضي أو تغييره لاحقاً في الإعدادات.',
  enableAlerts: 'تفعيل التنبيهات حتى لا تفوتك أي صلاة.',
  enableAllPrayerAlerts: 'تفعيل جميع تنبيهات الصلاة',
  next: 'التالي',
  finish: 'إنهاء',

  // Settings - Calculation panel
  fajrAngle: 'زاوية الفجر',
  enterDegreesValue: 'أدخل قيمة الدرجات',
  enterValueAfterSunset: 'أدخل قيمة الدقائق بعد غروب الشمس',
  ishaLabel: 'العشاء',
  enterValueAfterMaghrib: 'أدخل قيمة الدقائق بعد المغرب',
  enterMinutesAfterMidday: 'أدخل قيمة الدقائق بعد الظهر',
  higherLatitudes: 'العرض العالي',
  midnight: 'منتصف الليل',

  // Settings - Prayer panel
  uploadAzanSound: 'رفع صوت الأذان',
  addAudioFile:
    'أضف ملف MP3 أو WAV أو OGG أو M4A. سيظهر في قائمة الأصوات بعد الرفع.',
  uploading: 'جارٍ رفع الملف الصوتي...',
  azanSound: 'صوت الأذان',

  // Settings - Alert panel
  notificationBeforePrayer: 'إشعار قبل وقت الصلاة',

  // Toaster messages
  noLocationsFoundToast: 'لم يتم العثور على مواقع',
  errorFetchingLocationToast: 'خطأ في جلب الموقع',
  autostartEnabled: 'تم تمكين التشغيل التلقائي',
  autostartDisabled: 'تم تعطيل التشغيل التلقائي',
  failedToUpdateAutostart: 'فشل في تحديث إعداد التشغيل التلقائي',
  soundUploaded: 'تم رفع الصوت',
  soundReady: 'جاهز للاستخدام.',
  failedToUploadSound: 'فشل في رفع الملف الصوتي',
  pleaseTryAgain: 'يرجى المحاولة مرة أخرى.',

  // OpenStreetMap
  locationDataProvidedBy: 'بيانات الموقع مقدمة من',
} as const;

export type TranslationKey = keyof typeof ar;
