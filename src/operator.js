/**
 * Operator Commands Handler
 * 
 * Handles operator approval/rejection commands.
 * Strict permission validation.
 * Only Operator ID can execute commands.
 */

import { EVENT_CONFIG } from '../config/event.js';
import * as Database from './database.js';
import { MESSAGES } from './messages.js';
import { STATES } from './states.js';

const OPERATOR_ID = EVENT_CONFIG.operators.mainOperator;

/**
 * Parse operator command
 * Format: /command_userId
 * Returns: { command, userId } or null if invalid
 */
export function parseOperatorCommand(text) {
  if (!text || typeof text !== 'string') {
    return null;
  }

  const match = text.match(/^\/([a-z_]+)_(\d+)$/);
  if (!match) {
    return null;
  }

  const [, command, userId] = match;
  return {
    command,
    userId: parseInt(userId, 10),
  };
}

/**
 * Check if command is valid
 */
export function isValidOperatorCommand(command) {
  const validCommands = [
    'approve',
    'reject',
    'payapprove',
    'payreject',
  ];
  return validCommands.includes(command);
}

/**
 * Handle operator commands
 * Validates permission and command format
 */
export async function handleOperatorCommand(db, telegramApi, operatorId, message, env) {
  // Permission check
  if (operatorId !== OPERATOR_ID) {
    return {
      success: false,
      error: MESSAGES.OPERATOR_ONLY,
    };
  }

  // Parse command
  const parsed = parseOperatorCommand(message);
  if (!parsed || !isValidOperatorCommand(parsed.command)) {
    return {
      success: false,
      error: MESSAGES.INVALID_COMMAND_FORMAT,
    };
  }

  const { command, userId } = parsed;

  try {
    // Verify user exists
    const user = await Database.getUser(db, userId);

    switch (command) {
      case 'approve':
        return await handleDocumentApprove(db, telegramApi, userId, user, env);
      case 'reject':
        return await handleDocumentReject(db, telegramApi, userId, user, env);
      case 'payapprove':
        return await handlePaymentApprove(db, telegramApi, userId, user, env);
      case 'payreject':
        return await handlePaymentReject(db, telegramApi, userId, user, env);
      default:
        return { success: false, error: 'Unknown command' };
    }
  } catch (error) {
    console.error(`Operator command error: ${error.message}`);
    return {
      success: false,
      error: `خطا: ${error.message}`,
    };
  }
}

/**
 * Document Approval Handler
 */
async function handleDocumentApprove(db, telegramApi, userId, user, env) {
  if (user.state !== STATES.WAIT_OPERATOR_DOCUMENT) {
    return {
      success: false,
      error: `User not in document verification state. Current: ${user.state}`,
    };
  }

  if (user.document_verified === 1) {
    return {
      success: false,
      error: 'Document already approved',
    };
  }

  // Update database
  await Database.updateUserData(db, userId, {
    document_verified: 1,
  });

  // Update state to payment
  await Database.updateUserState(db, userId, STATES.GET_PAYMENT_RECEIPT);

  // Notify user
  try {
    const { PAYMENT_INSTRUCTIONS } = MESSAGES;
    await telegramApi.sendMessage(userId, {
      text: `${MESSAGES.DOCUMENT_APPROVED}\n\n${PAYMENT_INSTRUCTIONS}`,
      parse_mode: 'HTML',
    });
  } catch (error) {
    console.error(`Failed to notify user ${userId}: ${error.message}`);
  }

  return {
    success: true,
    message: `Document approved for user ${userId}`,
  };
}

/**
 * Document Rejection Handler
 */
async function handleDocumentReject(db, telegramApi, userId, user, env) {
  if (user.state !== STATES.WAIT_OPERATOR_DOCUMENT) {
    return {
      success: false,
      error: `User not in document verification state. Current: ${user.state}`,
    };
  }

  // Reset document data but keep user in GET_DOCUMENT state
  await Database.updateUserData(db, userId, {
    document_file_id: null,
    document_type: null,
  });

  await Database.updateUserState(db, userId, STATES.GET_DOCUMENT);

  // Notify user
  try {
    await telegramApi.sendMessage(userId, {
      text: MESSAGES.DOCUMENT_REJECTED,
    });
  } catch (error) {
    console.error(`Failed to notify user ${userId}: ${error.message}`);
  }

  return {
    success: true,
    message: `Document rejected for user ${userId}`,
  };
}

/**
 * Payment Approval Handler
 */
async function handlePaymentApprove(db, telegramApi, userId, user, env) {
  if (user.state !== STATES.WAIT_OPERATOR_PAYMENT) {
    return {
      success: false,
      error: `User not in payment verification state. Current: ${user.state}`,
    };
  }

  if (user.payment_verified === 1) {
    return {
      success: false,
      error: 'Payment already approved',
    };
  }

  // Update database
  await Database.updateUserData(db, userId, {
    payment_verified: 1,
    registration_completed: 1,
  });

  // Complete registration
  await Database.updateUserState(db, userId, STATES.REGISTRATION_COMPLETE);

  // Notify user and send completion materials
  try {
    let completionMessage = MESSAGES.REGISTRATION_COMPLETE;
    completionMessage += `\n📍 نشانی:\nنیشان: ${EVENT_CONFIG.locations.neshan}\nبلد: ${EVENT_CONFIG.locations.balad}\nگوگل‌مپ: ${EVENT_CONFIG.locations.googleMaps}`;
    completionMessage += `\n\n${MESSAGES.CME_INFO}`;

    await telegramApi.sendMessage(userId, {
      text: completionMessage,
      parse_mode: 'HTML',
    });

    // Send PDF
    const { sendPDFToUser } = await import('./pdf.js');
    await sendPDFToUser(telegramApi, userId, env);
  } catch (error) {
    console.error(`Failed to send completion materials to ${userId}: ${error.message}`);
  }

  return {
    success: true,
    message: `Payment approved for user ${userId}. Registration completed.`,
  };
}

/**
 * Payment Rejection Handler
 */
async function handlePaymentReject(db, telegramApi, userId, user, env) {
  if (user.state !== STATES.WAIT_OPERATOR_PAYMENT) {
    return {
      success: false,
      error: `User not in payment verification state. Current: ${user.state}`,
    };
  }

  // Reset payment data but keep in GET_PAYMENT_RECEIPT state
  await Database.updateUserData(db, userId, {
    payment_receipt_file_id: null,
  });

  await Database.updateUserState(db, userId, STATES.GET_PAYMENT_RECEIPT);

  // Notify user
  try {
    await telegramApi.sendMessage(userId, {
      text: MESSAGES.PAYMENT_REJECTED,
    });
  } catch (error) {
    console.error(`Failed to notify user ${userId}: ${error.message}`);
  }

  return {
    success: true,
    message: `Payment rejected for user ${userId}`,
  };
}

export default {
  parseOperatorCommand,
  isValidOperatorCommand,
  handleOperatorCommand,
};