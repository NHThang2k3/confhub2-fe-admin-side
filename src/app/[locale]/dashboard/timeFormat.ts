export function timeAgo(
  dateParam: string | Date | undefined,
  locale: string = "en"
): string {
  if (!dateParam) return getLocalizedMessage("unknown", locale);

  const date = typeof dateParam === "string" ? new Date(dateParam) : dateParam;
  if (isNaN(date.getTime()))
    return getLocalizedMessage("invalidDate", locale);

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals: { label: { [key: string]: string }; seconds: number }[] = [
    { label: { en: "year", vi: "năm", "zh-CN": "年", "zh-TW": "年", ja: "年", ru: "год", fr: "an", de: "Jahr", ar: "سنة", es: "año", fa: "سال" }, seconds: 31536000 },
    { label: { en: "month", vi: "tháng", "zh-CN": "个月", "zh-TW": "個月", ja: "ヶ月", ru: "месяц", fr: "mois", de: "Monat", ar: "شهر", es: "mes", fa: "ماه" }, seconds: 2592000 },
    { label: { en: "week", vi: "tuần", "zh-CN": "周", "zh-TW": "週", ja: "週間", ru: "неделя", fr: "semaine", de: "Woche", ar: "أسبوع", es: "semana", fa: "هفته" }, seconds: 604800 },
    { label: { en: "day", vi: "ngày", "zh-CN": "天", "zh-TW": "天", ja: "日", ru: "день", fr: "jour", de: "Tag", ar: "يوم", es: "día", fa: "روز" }, seconds: 86400 },
    { label: { en: "hour", vi: "giờ", "zh-CN": "小时", "zh-TW": "小時", ja: "時間", ru: "час", fr: "heure", de: "Stunde", ar: "ساعة", es: "hora", fa: "ساعت" }, seconds: 3600 },
    { label: { en: "minute", vi: "phút", "zh-CN": "分钟", "zh-TW": "分鐘", ja: "分", ru: "минута", fr: "minute", de: "Minute", ar: "دقيقة", es: "minuto", fa: "دقیقه" }, seconds: 60 },
    { label: { en: "second", vi: "giây", "zh-CN": "秒", "zh-TW": "秒", ja: "秒", ru: "секунда", fr: "seconde", de: "Sekunde", ar: "ثانية", es: "segundo", fa: "ثانیه" }, seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      const label = interval.label[locale] || interval.label.en;

      // Xử lý các trường hợp đặc biệt
      if (locale.startsWith("zh")) {
        return `${count}${label}`;
      } else if (locale === "ja") {
        return `${count}${label}前`;
      } else if (locale === "ru") {
        return russianTimeAgo(count, label);
      } else if (locale === "ar") {
        return arabicTimeAgo(count, label);
      } else if(locale === "fa"){
          return `${count} ${label} پیش`
      }
      return locale === "vi"
        ? `${count} ${label} trước`
        : `${count} ${label}${count > 1 ? "s" : ""} ago`;
    }
  }

  return getLocalizedMessage("justNow", locale);
}
//Hàm xử lý số nhiều tiếng Nga
function russianTimeAgo(count: number, label: string): string {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
        return `${count} ${label} назад`; // Số nhiều cho các trường hợp 11-19
    }

    switch (lastDigit) {
        case 1:
            //Thay đổi label cho số ít
            if(label === "год") return `${count} год назад`;
            if(label === "месяц") return `${count} месяц назад`;
            if(label === "неделя") return `${count} неделя назад`;
            if(label === "день") return `${count} день назад`;
            if(label === "час") return `${count} час назад`;
            if(label === "минута") return `${count} минута назад`;
            if(label === "секунда") return `${count} секунда назад`;
            return `${count} ${label} назад`;
        case 2:
        case 3:
        case 4:
             //Thay đổi label cho 2-4
            if(label === "год") return `${count} года назад`;
            if(label === "месяц") return `${count} месяца назад`;
            if(label === "неделя") return `${count} недели назад`;
            if(label === "день") return `${count} дня назад`;
            if(label === "час") return `${count} часа назад`;
            if(label === "минута") return `${count} минуты назад`;
            if(label === "секунда") return `${count} секунды назад`;
            return `${count} ${label} назад`;
        default:
            return `${count} ${label} назад`; // Số nhiều cho các trường hợp còn lại
    }
}

// Hàm xử lý số nhiều tiếng Ả Rập
function arabicTimeAgo(count: number, label: string): string {
  if (count === 1) {
    return `منذ ${label}`; // Since [label]
  } else if (count === 2) {
     if(label === "سنة") return `منذ سنتين`;
     if(label === "شهر") return `منذ شهرين`;
     if(label === "أسبوع") return `منذ أسبوعين`;
     if(label === "يوم") return `منذ يومين`;
     if(label === "ساعة") return `منذ ساعتين`;
     if(label === "دقيقة") return `منذ دقيقتين`;
     if(label === "ثانية") return `منذ ثانيتين`;
    return `منذ ${label}`;
  } else if (count >= 3 && count <= 10) {
     //Thay đổi cho số 3-10
     if(label === "سنة") return  `منذ ${count} سنوات`
     if(label === "شهر") return  `منذ ${count} أشهر`;
     if(label === "أسبوع") return `منذ ${count} أسابيع`;
     if(label === "يوم") return `منذ ${count} أيام`;
     if(label === "ساعة") return `منذ ${count} ساعات`;
     if(label === "دقيقة") return `منذ ${count} دقائق`;
     if(label === "ثانية") return `منذ ${count} ثواني`;
    return `منذ ${count} ${label}`;
  } else {
      //Thay đổi label số nhiều, số ít
     if(label === "سنة") return  `منذ ${count} سنة`
     if(label === "شهر") return  `منذ ${count} شهر`;
     if(label === "أسبوع") return `منذ ${count} أسبوع`;
     if(label === "يوم") return `منذ ${count} يوم`;
     if(label === "ساعة") return `منذ ${count} ساعة`;
     if(label === "دقيقة") return `منذ ${count} دقيقة`;
     if(label === "ثانية") return `منذ ${count} ثانية`;
    return `منذ ${count} ${label}`;
  }
}

//Hàm hỗ trợ đa ngôn ngữ
function getLocalizedMessage(key: string, locale: string): string {
  const messages: { [key: string]: { [key: string]: string } } = {
    unknown: {
      en: "Unknown",
      vi: "Không xác định",
      "zh-CN": "未知",
      "zh-TW": "未知",
      ja: "不明",
      ru: "Неизвестно",
      fr: "Inconnu",
      de: "Unbekannt",
      ar: "غير معروف",
      es: "Desconocido",
      fa: "ناشناخته",
    },
    invalidDate: {
      en: "Invalid Date",
      vi: "Ngày không hợp lệ",
      "zh-CN": "无效日期",
      "zh-TW": "無效日期",
      ja: "無効な日付",
      ru: "Неверная дата",
      fr: "Date invalide",
      de: "Ungültiges Datum",
      ar: "تاريخ غير صالح",
      es: "Fecha no válida",
      fa: "تاریخ نامعتبر",
    },
    justNow: {
      en: "Just now",
      vi: "Vừa xong",
      "zh-CN": "刚刚",
      "zh-TW": "剛剛",
      ja: "たった今",
      ru: "Только что",
      fr: "À l'instant",
      de: "Gerade eben",
      ar: "الآن",
      es: "Justo ahora",
      fa: "همین الان",
    },
    unknownDate: {
        en: "Unknown date",
        vi: "Không xác định",
        "zh-CN": "未知日期",
        "zh-TW": "未知日期",
        ja: "不明な日付",
        ru: "Неизвестная дата",
        fr: "Date inconnue",
        de: "Unbekanntes Datum",
        ar: "تاريخ غير معروف",
        es: "Fecha desconocida",
        fa: "تاریخ ناشناخته",
    }
  };

  return messages[key][locale] || messages[key]["en"]; // Fallback to English
}

export function formatDateFull(
  dateParam: string | Date | undefined,
  locale: string = "en"
): string {
  if (!dateParam) return getLocalizedMessage("unknownDate", locale);

  const date = typeof dateParam === "string" ? new Date(dateParam) : dateParam;
  if (isNaN(date.getTime()))
    return getLocalizedMessage("invalidDate", locale);

  let useLocale = locale;
  if (locale === "vi") {
    useLocale = "vi-VN";
  } else if (locale === "zh-CN" || locale === 'zh') {
    useLocale = "zh-CN";
  } else if (locale === "zh-TW") {
    useLocale = "zh-TW";
  } else if (locale === "ja") {
    useLocale = "ja-JP";
  } else if (locale === "ru") {
    useLocale = "ru-RU";
  } else if (locale === "fr") {
    useLocale = "fr-FR";
  } else if (locale === "de") {
    useLocale = "de-DE";
  } else if (locale === "ar") {
    useLocale = "ar"; // Arabic doesn't typically need a specific region code
  } else if (locale === "es") {
    useLocale = "es";  //  "es" is generally sufficient
  } else if (locale === "fa") {
    useLocale = "fa-IR"; // Persian (Iran)
  }


  return new Intl.DateTimeFormat(useLocale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    // second: "numeric",
    hour12: false,
  }).format(date);
}