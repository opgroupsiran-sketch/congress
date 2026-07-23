/**
 * Message Templates
 * 
 * All user-facing messages centralized.
 * Supports easy localization and style consistency.
 * Professional, Persian, short, readable format.
 */

import { EVENT_CONFIG, FIELDS, EDUCATION_LEVELS } from '../config/event.js';

export const MESSAGES = {
  // Welcome
  WELCOME: `سلام! 👋

به سامانه ثبت‌نام سمپوزیوم خوش‌آمدید.

${EVENT_CONFIG.event.title}

📅 ${EVENT_CONFIG.event.date}
⏰ ${EVENT_CONFIG.event.time}

برای ادامه، لطفاً نام کامل خود را وارد کنید:`,

  // Name Input
  GET_NAME_PROMPT: 'لطفاً نام کامل خود را وارد کنید:',
  INVALID_NAME: 'نام وارد شده نامعتبر است. حداقل 3 و حداکثر 100 کاراکتر.',

  // National ID
  GET_NATIONAL_ID_PROMPT: 'لطفاً کد ملی خود را وارد کنید (بدون خط تیره):',
  INVALID_NATIONAL_ID: 'کد ملی باید 10 رقم باشد.',
  DUPLICATE_NATIONAL_ID: 'این کد ملی قبلاً ثبت‌نام شده است.',

  // Field
  GET_FIELD_PROMPT: 'لطفاً رشته تحصیلی خود را انتخاب کنید:',

  // Education Level
  GET_LEVEL_PROMPT: 'سطح تحصیلی خود را انتخاب کنید:',
  LEVEL_STUDENT: 'دانشجو',
  LEVEL_GRADUATE: 'فارغ‌التحصیل',
  LEVEL_SPECIALIST: 'تخصص‌دار',
  LEVEL_RESIDENT: 'فلوشیپ/رزیدنت',
  LEVEL_FACULTY: 'عضو هیات‌علمی',
  LEVEL_OTHER: 'سایر',

  // Phone
  GET_PHONE_PROMPT: 'لطفاً شماره موبایل خود را وارد کنید (با پیش‌فیکس 0):',
  INVALID_PHONE: 'شماره موبایل باید 11 رقم باشد و با 0 شروع شود.',

  // Document
  GET_DOCUMENT_PROMPT:
    'لطفاً یکی از موارد زیر را آپلود کنید:\n\n📄 کارت دانشجویی\nیا\n🏥 کارت نظام‌پزشکی',
  INVALID_DOCUMENT_TYPE: 'نوع فایل پشتیبانی نشده است. فقط عکس یا PDF قبول است.',
  DOCUMENT_TOO_LARGE: `حجم فایل نباید از ${EVENT_CONFIG.validation.documentMaxSizeMB}MB تجاوز کند.`,

  // Waiting for Operator - Document
  DOCUMENT_SUBMITTED: 'سند شما ثبت شد. ✓\n\nدر انتظار تأیید توسط اپراتور...',
  DOCUMENT_APPROVED:
    'سند شما تأیید شد! ✓\n\nحالا می‌تونید اقدام به پرداخت کنید.',
  DOCUMENT_REJECTED: 'متأسفانه سند شما تأیید نشد. ❌\n\nلطفاً دوباره تلاش کنید.',

  // Payment Instructions
  PAYMENT_INSTRUCTIONS: `درخواست پرداخت شما ثبت شد.\n\n💳 راهنمای پرداخت:\n\nبانک: ${EVENT_CONFIG.payment.bank}
نام حساب: ${EVENT_CONFIG.payment.accountName}\n\n\`\`\`
${EVENT_CONFIG.payment.cardNumberFormatted}
\`\`\`\n\nپس از انتقال وجه، رسید پرداخت را آپلود کنید.`,

  GET_RECEIPT_PROMPT: 'لطفاً رسید انتقال وجه را آپلود کنید:',
  INVALID_RECEIPT_TYPE: 'نوع فایل پشتیبانی نشده است. فقط عکس یا PDF قبول است.',
  RECEIPT_TOO_LARGE: `حجم فایل نباید از ${EVENT_CONFIG.validation.receiptMaxSizeMB}MB تجاوز کند.`,

  // Waiting for Operator - Payment
  RECEIPT_SUBMITTED: 'رسید شما ثبت شد. ✓\n\nدر انتظار تأیید توسط اپراتور...',
  PAYMENT_APPROVED: 'پرداخت شما تأیید شد! ✓',
  PAYMENT_REJECTED: 'متأسفانه رسید شما تأیید نشد. ❌\n\nلطفاً دوباره تلاش کنید.',

  // Registration Complete
  REGISTRATION_COMPLETE: `تبریک! 🎉

ثبت‌نام شما با موفقیت انجام شد.\n\nمشخصات رویداد:\n${EVENT_CONFIG.event.title}\n📅 ${EVENT_CONFIG.event.date}
⏰ ${EVENT_CONFIG.event.time}
🚪 ورودی: ${EVENT_CONFIG.event.admission}\n\n📍 موقعیت رویداد:\n`,

  CME_INFO: `برای ثبت‌نام جهت دریافت واحد CME:\n\n🔗 ${EVENT_CONFIG.cme.website}\n\nکد برنامه: \`${EVENT_CONFIG.cme.programCode}\``,

  // Errors
  UNEXPECTED_ERROR: 'خطا رخ داد. لطفاً دوباره تلاش کنید.',
  INVALID_COMMAND: 'فرمان شناخته‌شده نیست.',
  STATE_ERROR: 'اطلاعات سشن نامعتبر است. لطفاً دوباره شروع کنید.',

  // Operator
  OPERATOR_ONLY: 'فقط اپراتور می‌تواند این دستور را اجرا کند.',
  INVALID_COMMAND_FORMAT: 'فرمت دستور صحیح نیست.',
};

/**
 * Get education level display name
 */
export function getLevelDisplayName(level) {
  const mapping = {
    [EDUCATION_LEVELS.STUDENT]: MESSAGES.LEVEL_STUDENT,
    [EDUCATION_LEVELS.GRADUATE]: MESSAGES.LEVEL_GRADUATE,
    [EDUCATION_LEVELS.SPECIALIST]: MESSAGES.LEVEL_SPECIALIST,
    [EDUCATION_LEVELS.RESIDENT]: MESSAGES.LEVEL_RESIDENT,
    [EDUCATION_LEVELS.FACULTY]: MESSAGES.LEVEL_FACULTY,
    [EDUCATION_LEVELS.OTHER]: MESSAGES.LEVEL_OTHER,
  };
  return mapping[level] || level;
}

/**
 * Build keyboard with fields
 */
export function buildFieldsKeyboard() {
  return {
    inline_keyboard: FIELDS.map((field) => [{ text: field, callback_data: `field_${field}` }]),
  };
}

/**
 * Build keyboard with education levels
 */
export function buildLevelsKeyboard() {
  return {
    inline_keyboard: [
      [{ text: MESSAGES.LEVEL_STUDENT, callback_data: EDUCATION_LEVELS.STUDENT }],
      [{ text: MESSAGES.LEVEL_GRADUATE, callback_data: EDUCATION_LEVELS.GRADUATE }],
      [{ text: MESSAGES.LEVEL_SPECIALIST, callback_data: EDUCATION_LEVELS.SPECIALIST }],
      [{ text: MESSAGES.LEVEL_RESIDENT, callback_data: EDUCATION_LEVELS.RESIDENT }],
      [{ text: MESSAGES.LEVEL_FACULTY, callback_data: EDUCATION_LEVELS.FACULTY }],
      [{ text: MESSAGES.LEVEL_OTHER, callback_data: EDUCATION_LEVELS.OTHER }],
    ],
  };
}

/**
 * Build keyboard with document types
 */
export function buildDocumentTypeKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '📄 کارت دانشجویی', callback_data: 'doc_student_card' }],
      [{ text: '🏥 کارت نظام‌پزشکی', callback_data: 'doc_medical_council_card' }],
    ],
  };
}

export default MESSAGES;