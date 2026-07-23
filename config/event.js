/**
 * Static Event Configuration
 * Symposium: رویکردهای نوین در توانبخشی اسکولیوز
 */

export const EVENT = Object.freeze({
  title: 'رویکردهای نوین در توانبخشی اسکولیوز',
  date: 'جمعه 16 مرداد 1405',
  time: '08:30 - 16:00',
  admission: '08:00',
  cmeCredits: 5,
  programCode: '256640',
});

export const PAYMENT = Object.freeze({
  bank: 'بانک رفاه کارگران',
  accountName: 'انجمن علمی ارتوز و پروتز ایران',
  cardNumber: '5894637000304284',
  cardNumberFormatted: '5894 6370 0030 4284',
});

export const LOCATION = Object.freeze({
  neshan: 'https://neshan.org/maps/places/sbvrr6WxuVPr',
  balad: 'https://balad.ir/p/3bv0csxr7VbXHT',
  googleMaps: 'https://maps.app.goo.gl/ibnZSLNYxKj7Fx5w6',
});

export const CME = Object.freeze({
  website: 'https://www.ircme.ir/App_Web/(Guest)/Membership/Login.aspx?CenterID=57',
  programCode: '256640',
});

export const OPERATOR = Object.freeze({
  telegramId: 1327554109,
});

export const PDF = Object.freeze({
  filename: 'symposiumplane2026.pdf',
});

export const MEDIA = Object.freeze({
  maxSizeBytes: 10 * 1024 * 1024,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
});
