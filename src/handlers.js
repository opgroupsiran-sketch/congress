/**
 * User Message Handlers
 * 
 * Handles all user conversation states.
 * Validates input and manages state transitions.
 * Forwards documents to operator when needed.
 */

import * as Database from './database.js';
import { MESSAGES, buildFieldsKeyboard, buildLevelsKeyboard } from './messages.js';
import { STATES, isValidTransition, getNextStateInSequence } from './states.js';
import { EVENT_CONFIG, FIELDS, EDUCATION_LEVELS, DOCUMENT_TYPES } from '../config/event.js';

/**
 * Handle /start command
 */
export async function handleStart(db, telegramApi, userId) {
  const user = await Database.getOrCreateUser(db, userId);

  if (user.registration_completed === 1) {
    await telegramApi.sendMessage(userId, {
      text: 'شما قبلاً ثبت‌نام شده‌اید. 📋',
    });
    return;
  }

  await Database.updateUserState(db, userId, STATES.START);

  await telegramApi.sendMessage(userId, {
    text: MESSAGES.WELCOME,
    parse_mode: 'HTML',
  });
}

/**
 * Handle name input
 */
export async function handleNameInput(db, telegramApi, userId, name) {
  const user = await Database.getUser(db, userId);

  if (user.state !== STATES.GET_NAME && user.state !== STATES.START) {
    return;
  }

  // Validate name
  const trimmedName = name.trim();
  if (
    trimmedName.length < EVENT_CONFIG.validation.nameMinLength
    || trimmedName.length > EVENT_CONFIG.validation.nameMaxLength
  ) {
    await telegramApi.sendMessage(userId, {
      text: MESSAGES.INVALID_NAME,
    });
    return;
  }

  // Update user data
  await Database.updateUserData(db, userId, { name: trimmedName });
  await Database.updateUserState(db, userId, STATES.GET_NATIONAL_ID);

  await telegramApi.sendMessage(userId, {
    text: MESSAGES.GET_NATIONAL_ID_PROMPT,
  });
}

/**
 * Handle national ID input
 */
export async function handleNationalIdInput(db, telegramApi, userId, nationalId) {
  const user = await Database.getUser(db, userId);

  if (user.state !== STATES.GET_NATIONAL_ID) {
    return;
  }

  // Validate format
  const cleaned = nationalId.replace(/[^\d]/g, '');
  if (cleaned.length !== EVENT_CONFIG.validation.nationalIdLength) {
    await telegramApi.sendMessage(userId, {
      text: MESSAGES.INVALID_NATIONAL_ID,
    });
    return;
  }

  // Check duplicate
  const duplicate = await Database.checkDuplicateNationalId(db, cleaned);
  if (duplicate) {
    await telegramApi.sendMessage(userId, {
      text: MESSAGES.DUPLICATE_NATIONAL_ID,
    });
    return;
  }

  // Update user data
  await Database.updateUserData(db, userId, { national_id: cleaned });
  await Database.updateUserState(db, userId, STATES.GET_FIELD);

  await telegramApi.sendMessage(userId, {
    text: MESSAGES.GET_FIELD_PROMPT,
    reply_markup: buildFieldsKeyboard(),
  });
}

/**
 * Handle field selection (callback query)
 */
export async function handleFieldSelection(db, telegramApi, userId, field) {
  const user = await Database.getUser(db, userId);

  if (user.state !== STATES.GET_FIELD) {
    return;
  }

  if (!FIELDS.includes(field)) {
    return;
  }

  await Database.updateUserData(db, userId, { field });
  await Database.updateUserState(db, userId, STATES.GET_LEVEL);

  await telegramApi.sendMessage(userId, {
    text: MESSAGES.GET_LEVEL_PROMPT,
    reply_markup: buildLevelsKeyboard(),
  });
}

/**
 * Handle education level selection (callback query)
 */
export async function handleLevelSelection(db, telegramApi, userId, level) {
  const user = await Database.getUser(db, userId);

  if (user.state !== STATES.GET_LEVEL) {
    return;
  }

  const validLevels = Object.values(EDUCATION_LEVELS);
  if (!validLevels.includes(level)) {
    return;
  }

  await Database.updateUserData(db, userId, { education_level: level });
  await Database.updateUserState(db, userId, STATES.GET_PHONE);

  await telegramApi.sendMessage(userId, {
    text: MESSAGES.GET_PHONE_PROMPT,
  });
}

/**
 * Handle phone number input
 */
export async function handlePhoneInput(db, telegramApi, userId, phone) {
  const user = await Database.getUser(db, userId);

  if (user.state !== STATES.GET_PHONE) {
    return;
  }

  // Validate format
  const cleaned = phone.replace(/[^\d]/g, '');
  if (
    cleaned.length !== EVENT_CONFIG.validation.phoneLength
    || !cleaned.startsWith(EVENT_CONFIG.validation.phonePrefix)
  ) {
    await telegramApi.sendMessage(userId, {
      text: MESSAGES.INVALID_PHONE,
    });
    return;
  }

  await Database.updateUserData(db, userId, { phone: cleaned });
  await Database.updateUserState(db, userId, STATES.GET_DOCUMENT);

  await telegramApi.sendMessage(userId, {
    text: MESSAGES.GET_DOCUMENT_PROMPT,
  });
}

/**
 * Handle document upload
 */
export async function handleDocumentUpload(
  db,
  telegramApi,
  userId,
  update,
  operatorId,
  env
) {
  const user = await Database.getUser(db, userId);

  if (user.state !== STATES.GET_DOCUMENT) {
    return;
  }

  // Extract document info from update
  let fileId, fileName, mimeType, fileSize;

  if (update.message.photo) {
    // Photo upload
    const photo = update.message.photo[update.message.photo.length - 1];
    fileId = photo.file_id;
    mimeType = 'image/jpeg';
    const file = await telegramApi.getFile(fileId);
    fileSize = file.result.file_size;
  } else if (update.message.document) {
    // Document upload
    const doc = update.message.document;
    fileId = doc.file_id;
    fileName = doc.file_name;
    mimeType = doc.mime_type;
    fileSize = doc.file_size;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(mimeType)) {
      await telegramApi.sendMessage(userId, {
        text: MESSAGES.INVALID_DOCUMENT_TYPE,
      });
      return;
    }
  } else {
    await telegramApi.sendMessage(userId, {
      text: MESSAGES.INVALID_DOCUMENT_TYPE,
    });
    return;
  }

  // Validate file size
  const maxSizeBytes = EVENT_CONFIG.validation.documentMaxSizeMB * 1024 * 1024;
  if (fileSize > maxSizeBytes) {
    await telegramApi.sendMessage(userId, {
      text: MESSAGES.DOCUMENT_TOO_LARGE,
    });
    return;
  }

  // Save to database
  await Database.updateUserData(db, userId, {
    document_file_id: fileId,
    document_type: 'verified', // Mark as pending verification
  });

  await Database.updateUserState(db, userId, STATES.WAIT_OPERATOR_DOCUMENT);

  // Forward document to operator
  try {
    await forwardDocumentToOperator(telegramApi, operatorId, userId, user, fileId);
  } catch (error) {
    console.error(`Failed to forward document: ${error.message}`);
    // Don't fail user experience, just log
  }

  await telegramApi.sendMessage(userId, {
    text: MESSAGES.DOCUMENT_SUBMITTED,
  });
}

/**
 * Handle payment receipt upload
 */
export async function handleReceiptUpload(db, telegramApi, userId, update, operatorId) {
  const user = await Database.getUser(db, userId);

  if (user.state !== STATES.GET_PAYMENT_RECEIPT) {
    return;
  }

  // Extract document info from update
  let fileId, fileName, mimeType, fileSize;

  if (update.message.photo) {
    const photo = update.message.photo[update.message.photo.length - 1];
    fileId = photo.file_id;
    mimeType = 'image/jpeg';
    const file = await telegramApi.getFile(fileId);
    fileSize = file.result.file_size;
  } else if (update.message.document) {
    const doc = update.message.document;
    fileId = doc.file_id;
    fileName = doc.file_name;
    mimeType = doc.mime_type;
    fileSize = doc.file_size;

    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(mimeType)) {
      await telegramApi.sendMessage(userId, {
        text: MESSAGES.INVALID_RECEIPT_TYPE,
      });
      return;
    }
  } else {
    await telegramApi.sendMessage(userId, {
      text: MESSAGES.INVALID_RECEIPT_TYPE,
    });
    return;
  }

  // Validate file size
  const maxSizeBytes = EVENT_CONFIG.validation.receiptMaxSizeMB * 1024 * 1024;
  if (fileSize > maxSizeBytes) {
    await telegramApi.sendMessage(userId, {
      text: MESSAGES.RECEIPT_TOO_LARGE,
    });
    return;
  }

  // Save to database
  await Database.updateUserData(db, userId, {
    payment_receipt_file_id: fileId,
  });

  await Database.updateUserState(db, userId, STATES.WAIT_OPERATOR_PAYMENT);

  // Forward receipt to operator
  try {
    await forwardReceiptToOperator(telegramApi, operatorId, userId, user, fileId);
  } catch (error) {
    console.error(`Failed to forward receipt: ${error.message}`);
  }

  await telegramApi.sendMessage(userId, {
    text: MESSAGES.RECEIPT_SUBMITTED,
  });
}

/**
 * Forward document to operator for verification
 */
async function forwardDocumentToOperator(telegramApi, operatorId, userId, user, fileId) {
  const caption = `
📋 اطلاعات کاربر:

👤 نام: ${user.name}
🆔 کد ملی: ${user.national_id}
📚 رشته: ${user.field}
🎓 سطح: ${user.education_level}
📱 تلفن: ${user.phone}

👥 User ID: ${userId}
🔗 Command: /approve_${userId} یا /reject_${userId}
  `.trim();

  await telegramApi.forwardMessage(operatorId, userId, {
    message_id: fileId, // This is a simplified approach; proper implementation needs file download
  });

  await telegramApi.sendMessage(operatorId, {
    text: caption,
    parse_mode: 'HTML',
  });
}

/**
 * Forward receipt to operator for verification
 */
async function forwardReceiptToOperator(telegramApi, operatorId, userId, user, fileId) {
  const caption = `
💳 رسید پرداخت:

👤 نام: ${user.name}
🆔 کد ملی: ${user.national_id}
📱 تلفن: ${user.phone}

👥 User ID: ${userId}
🔗 Command: /payapprove_${userId} یا /payreject_${userId}
  `.trim();

  await telegramApi.sendMessage(operatorId, {
    text: caption,
    parse_mode: 'HTML',
  });
}

export default {
  handleStart,
  handleNameInput,
  handleNationalIdInput,
  handleFieldSelection,
  handleLevelSelection,
  handlePhoneInput,
  handleDocumentUpload,
  handleReceiptUpload,
};