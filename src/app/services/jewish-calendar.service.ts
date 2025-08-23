import { Injectable } from '@angular/core';
import { GeoLocation, HDate, Locale, Zmanim, gematriya } from '@hebcal/core';
import { HebrewCalendar, Location } from '@hebcal/core';


@Injectable({ providedIn: 'root' })
export class JewishCalendarService {
  private readonly location = new GeoLocation('Tel Aviv', 32.0853, 34.7818, 34, 'Asia/Jerusalem');
  private calendarEvents: IEventInfo[] = [];

  constructor() {
      // אתחול האירועים פעם אחת בקונסטרקטור יכול לחסוך חישובים חוזרים
      this.generateEvents();
  }

  setLocation() {
    this.location; // Already set in initialization
  }

  getHebrewDate(year: number, month: number, day: number): string {
    const hebrewDate = new HDate(new Date(year, month - 1, day)); // month is 0-based in JS Date
    return hebrewDate.renderGematriya();
  }

  getHebMonth(year: number, month: number, day: number): string {
    const hebrewDate = new HDate(new Date(year, month - 1, day));
    return hebrewDate.render('he', false);
  }

  getMonthName(month: number): string {
    return hebrewMonthsNamesLeap.find(m => m.index === month)?.he ?? '';
  }

  getHebYear(fullDate: Date): string {
    return gematriya(new HDate(fullDate).getFullYear());
  }

  translate(str: string, locale: string = 'he'): string {
    return Locale.lookupTranslation(str, locale) || str;
  }

  gematriya(n: number): string {
    return gematriya(n);
  }

  generateEvents(year: number = new Date().getFullYear(), latitude?: number, longitude?: number): IHebcalEventInfo[] {


const location = new Location( 31.7683, 35.2137, true, 'Asia/Jerusalem');

const calenderSettings = {
  year: 2025,
  isHebrewYear: false,
  candlelighting: true,
  il: true,
  sedrot: true,
  omer: true,
  locale: 'he',
  shabbatMevarchim: true,
  yomKippurKatan: true,
  noModern: true,
  molad: true,
  location: location
};

this.calendarEvents = [];
const events = HebrewCalendar.calendar(calenderSettings);



    this.calendarEvents = events.map(ev => ({
      dateStr: new HDate(ev.getDate()).greg().toLocaleDateString('he-IL'),
      hebDate: new HDate(ev.getDate()).renderGematriya(),
      hebName: ev.render('he'),
      hebNoNikud: ev.render('he-x-NoNikud'),
      event: ev,
      emoji: !ev.render('he').includes('פֶּסַח') ? ev.getEmoji() : null,
      mask: ev.getFlags(),
      flags: ev.getFlags(),
      categories: ev.getCategories(),
      desc: ev.getDesc(),
    }));

    // console.log(this.calendarEvents);

    return this.calendarEvents;
  }

createDayObject(fullDate: Date): IDayObject {
    const hDate = new HDate(fullDate);
    
    // שלב 1: קבל את כל הזמנים ההלכתיים הבסיסיים
    const zmanim: IZmanim = this.getZmanim(fullDate);
    
    // שלב 2: סנן את כל אירועי השנה ומצא רק את אלו של היום
    const dayEvents = this.calendarEvents.filter(ev => ev.dateStr === fullDate.toLocaleDateString('he-IL'));
    
    // שלב 3: חפש אירועים מיוחדים והוסף אותם לאובייקט הזמנים
    const candleLightingEvent = dayEvents.find(ev => ev.categories.includes('candles'));
    const havdalahEvent = dayEvents.find(ev => ev.categories.includes('havdalah'));

    const candleLightingTime = this.formatEventTime(candleLightingEvent?.event.eventTime);
    const havdalahTime = this.formatEventTime(havdalahEvent?.event.eventTime);

    if (candleLightingTime) {
      zmanim.candleLighting = { name: 'Candle Lighting', hebName: 'הדלקת נרות', time: candleLightingTime };
    }
    if (havdalahTime) {
      zmanim.havdalah = { name: 'Havdalah', hebName: 'הבדלה', time: havdalahTime };
    }

    const dayObj: IDayObject = {
      ge: { fullDate, day: fullDate.getDay(), date: fullDate.getDate(), month: fullDate.getMonth(), year: fullDate.getFullYear() },
      he: { fullDate: hDate.renderGematriya(false), day: hDate.getDay(), date: hDate.getDate(), month: hDate.getMonth(), year: hDate.getFullYear() },
      zmanim: zmanim,
      hallel: HebrewCalendar.hallel(hDate, true) === 1 ? 'חצי הלל' : HebrewCalendar.hallel(hDate, true) === 2 ? 'הלל שלם' : undefined,
      events: dayEvents.length > 0 ? dayEvents : undefined,
      dailyLearn: {},
    };

    if (!dayObj.hallel) delete dayObj.hallel;

    return dayObj;
  }

    private formatEventTime(eventTime: Date | undefined): string | null {
    if (!eventTime) return null;
    return new Intl.DateTimeFormat('he-IL', {
        hour: '2-digit', minute: '2-digit', hour12: false,
    }).format(eventTime);
  }
getZmanim(date: Date): IZmanim {
    const zmanimInstance = new Zmanim(this.location, date, true);
    const dateTimeFormat = new Intl.DateTimeFormat('he-IL', {
      hour: '2-digit', minute: '2-digit', hour12: false,
    });

    
    return {
      date: date.toLocaleDateString('he-IL'),
      hebDate: new HDate(date).renderGematriya(),
      sunrise: { name: 'Sunrise', hebName: 'זריחה', time: Zmanim.formatTime(zmanimInstance.sunrise(), dateTimeFormat) ?? '' },
      sunset: { name: 'Sunset', hebName: 'שקיעה', time: Zmanim.formatTime(zmanimInstance.sunset(), dateTimeFormat) ?? '' },
      dawn: { name: 'Dawn', hebName: 'אפלולית', time: Zmanim.formatTime(zmanimInstance.dawn(), dateTimeFormat) ?? '' },
      dusk: { name: 'Dusk', hebName: 'השקפת החמה', time: Zmanim.formatTime(zmanimInstance.dusk(), dateTimeFormat) ?? '' },
      eveningTime: { name: 'Evening Time', hebName: 'זמן הערב', time: Zmanim.formatTime(zmanimInstance.gregEve(), dateTimeFormat) ?? '' },
      chatzot: { name: 'Chatzot', hebName: 'חצות היום', time: Zmanim.formatTime(zmanimInstance.chatzot(), dateTimeFormat) ?? '' },
      chatzotNightTime: { name: 'Chatzot Night Time', hebName: 'חצות הלילה', time: Zmanim.formatTime(zmanimInstance.chatzotNight(), dateTimeFormat) ?? '' },
      alotHaShachar: { name: 'Alot HaShachar', hebName: 'עלות השחר', time: Zmanim.formatTime(zmanimInstance.alotHaShachar(), dateTimeFormat) ?? '' },
      misheyakir: { name: 'Misheyakir', hebName: 'מִשֶּׁיַּכִּיר', time: Zmanim.formatTime(zmanimInstance.misheyakir(), dateTimeFormat) ?? '' },
      misheyakirMachmir: { name: 'Misheyakir Machmir', hebName: 'מִשֶּׁיַּכִּיר מחמיר', time: Zmanim.formatTime(zmanimInstance.misheyakirMachmir(), dateTimeFormat) ?? '' },
      sofZmanShma: { name: 'Sof Zman Shma', hebName: 'סוף זמן קריאת שמע', time: Zmanim.formatTime(zmanimInstance.sofZmanShma(), dateTimeFormat) ?? '' },
      sofZmanTfilla: { name: 'Sof Zman Tfilla', hebName: 'סוף זמן תפילה', time: Zmanim.formatTime(zmanimInstance.sofZmanTfilla(), dateTimeFormat) ?? '' },
      minchaGedola: { name: 'Mincha Gedola', hebName: 'מנחה גדולה', time: Zmanim.formatTime(zmanimInstance.minchaGedola(), dateTimeFormat) ?? '' },
      minchaKetana: { name: 'Mincha Ketana', hebName: 'מנחה קטנה', time: Zmanim.formatTime(zmanimInstance.minchaKetana(), dateTimeFormat) ?? '' },
      plagHaMincha: { name: 'Plag HaMincha', hebName: 'פלג המנחה', time: Zmanim.formatTime(zmanimInstance.plagHaMincha(), dateTimeFormat) ?? '' },
      tzeitHaKochavim: { name: 'Tzeit HaKochavim', hebName: 'צאת הכוכבים', time: Zmanim.formatTime(zmanimInstance.tzeit(), dateTimeFormat) ?? '' },
      neitzHaChama: { name: 'Neitz HaChama', hebName: 'נץ החמה', time: Zmanim.formatTime(zmanimInstance.neitzHaChama(), dateTimeFormat) ?? '' },
      shkiah: { name: 'Shkiah', hebName: 'שקיעה', time: Zmanim.formatTime(zmanimInstance.shkiah(), dateTimeFormat) ?? '' },
        // candleLighting: { name: 'Candle Lighting', hebName: 'הדלקת נרות', time: Zmanim.formatTime(zmanimInstance.candleLighting(), dateTimeFormat) ?? '' },
        // havdalah: { name: 'Havdalah', hebName: 'הבדלה', time: Zmanim.formatTime(zmanimInstance.havdalah(), dateTimeFormat) ?? '' },
    };
  }
}

export interface IEventInfo {
  dateStr: string;
  hebDate: string;
  hebName: string;
  hebNoNikud: string;
  event: any;
  emoji: string | null;
  mask: number;
  flags: number;
  categories: string[];
  desc: string;
}

export interface IHebcalEventInfo { 
  dateStr: string;
  hebDate: string;
  hebName: string;
  hebNoNikud: string;
  event: Event; // שימוש בטייפ המדויק
  emoji: string | null;
  mask: number;
  flags: number;
  categories: string[];
  desc: string;
}

export interface IZman {
  name: string;
  hebName: string;
  time: string;
}

export interface IZmanim {
  date: string;
  hebDate: string;
  sunrise: IZman;
  sunset: IZman;
  dawn: IZman;
  dusk: IZman;
  eveningTime: IZman;
  chatzot: IZman;
  chatzotNightTime: IZman;
  alotHaShachar: IZman;
  misheyakir: IZman;
  misheyakirMachmir: IZman;
  sofZmanShma: IZman;
  sofZmanTfilla: IZman;
  minchaGedola: IZman;
  minchaKetana: IZman;
  plagHaMincha: IZman;
  tzeitHaKochavim: IZman;
  neitzHaChama: IZman;
  shkiah: IZman;
  candleLighting?: IZman;
  havdalah?: IZman;
}

export interface IDayObject {
  ge: {
    fullDate: Date;
    day: number;
    date: number;
    month: number;
    year: number;
  };
  he: {
    fullDate: string;
    day: number;
    date: number;
    month: number;
    year: number;
  };
  zmanim: IZmanim;
  hallel?: string;
  events?: IEventInfo[];
  dailyLearn: { [key: string]: any };
}

export enum HebrewMonths {
  Nisan = 1,
  Iyyar = 2,
  Sivan = 3,
  Tamuz = 4,
  Av = 5,
  Elul = 6,
  Tishrei = 7,
  Cheshvan = 8,
  Kislev = 9,
  Tevet = 10,
  Shvat = 11,
  AdarI = 12,
  AdarII = 13,
}

export interface NameInfo {
  index: number;
  name: string;
  he: string;
  letter?: string;
  short?: string;
}

export const daysNames: NameInfo[] = [
  { index: 0, name: 'Sunday', he: 'ראשון', letter: 'א׳' },
  { index: 1, name: 'Monday', he: 'שני', letter: 'ב׳' },
  { index: 2, name: 'Tuesday', he: 'שלישי', letter: 'ג׳' },
  { index: 3, name: 'Wednesday', he: 'רביעי', letter: 'ד׳' },
  { index: 4, name: 'Thursday', he: 'חמישי', letter: 'ה׳' },
  { index: 5, name: 'Friday', he: 'שישי', letter: 'ו׳' },
  { index: 6, name: 'Saturday', he: 'שבת', letter: 'ש׳' },
];

export const monthsNames: NameInfo[] = [
  { index: 0, name: 'January', short: 'Jan', he: 'ינואר' },
  { index: 1, name: 'February', short: 'Feb', he: 'פברואר' },
  { index: 2, name: 'March', short: 'Mar', he: 'מרץ' },
  { index: 3, name: 'April', short: 'Apr', he: 'אפריל' },
  { index: 4, name: 'May', short: 'May', he: 'מאי' },
  { index: 5, name: 'June', short: 'Jun', he: 'יוני' },
  { index: 6, name: 'July', short: 'Jul', he: 'יולי' },
  { index: 7, name: 'August', short: 'Aug', he: 'אוגוסט' },
  { index: 8, name: 'September', short: 'Sep', he: 'ספטמבר' },
  { index: 9, name: 'October', short: 'Oct', he: 'אוקטובר' },
  { index: 10, name: 'November', short: 'Nov', he: 'נובמבר' },
  { index: 11, name: 'December', short: 'Dec', he: 'דצמבר' },
];

export const hebrewMonthsNamesLeap: NameInfo[] = [
  { index: HebrewMonths.Nisan, name: 'Nisan', he: 'נִיסָן' },
  { index: HebrewMonths.Iyyar, name: 'Iyyar', he: 'אִיָיר' },
  { index: HebrewMonths.Sivan, name: 'Sivan', he: 'סִיוָן' },
  { index: HebrewMonths.Tamuz, name: 'Tamuz', he: 'תַּמּוּז' },
  { index: HebrewMonths.Av, name: 'Av', he: 'אָב' },
  { index: HebrewMonths.Elul, name: 'Elul', he: 'אֱלוּל' },
  { index: HebrewMonths.Tishrei, name: 'Tishrei', he: 'תִּשְׁרֵי' },
  { index: HebrewMonths.Cheshvan, name: 'Cheshvan', he: 'חֶשְׁוָן' },
  { index: HebrewMonths.Kislev, name: 'Kislev', he: 'כִּסְלֵו' },
  { index: HebrewMonths.Tevet, name: 'Tevet', he: 'טֵבֵת' },
  { index: HebrewMonths.Shvat, name: 'Shvat', he: 'שְׁבָט' },
  { index: HebrewMonths.AdarI, name: 'Adar I', he: 'אַדָר א׳' },
  { index: HebrewMonths.AdarII, name: 'Adar II', he: 'אַדָר ב׳' },
];

export const hebrewMonthsNamesNoLeap: NameInfo[] = [
  { index: HebrewMonths.Nisan, name: 'Nisan', he: 'נִיסָן' },
  { index: HebrewMonths.Iyyar, name: 'Iyyar', he: 'אִיָיר' },
  { index: HebrewMonths.Sivan, name: 'Sivan', he: 'סִיוָן' },
  { index: HebrewMonths.Tamuz, name: 'Tamuz', he: 'תַּמּוּז' },
  { index: HebrewMonths.Av, name: 'Av', he: 'אָב' },
  { index: HebrewMonths.Elul, name: 'Elul', he: 'אֱלוּל' },
  { index: HebrewMonths.Tishrei, name: 'Tishrei', he: 'תִּשְׁרֵי' },
  { index: HebrewMonths.Cheshvan, name: 'Cheshvan', he: 'חֶשְׁוָן' },
  { index: HebrewMonths.Kislev, name: 'Kislev', he: 'כִּסְלֵו' },
  { index: HebrewMonths.Tevet, name: 'Tevet', he: 'טֵבֵת' },
  { index: HebrewMonths.Shvat, name: 'Shvat', he: 'שְׁבָט' },
  { index: HebrewMonths.AdarI, name: 'Adar', he: 'אַדָר' },
];