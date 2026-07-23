/**
 * PDF Handler
 * 
 * Manages PDF sending to users.
 * Handles file fetching and error cases.
 * Decoupled from Telegram logic.
 */

import { EVENT_CONFIG } from '../config/event.js';

const PDF_PATH = `assets/${EVENT_CONFIG.assets.pdf}`;

/**
 * Send PDF to user
 * Always sends from asset (no caching needed initially)
 */
export async function sendPDFToUser(telegramApi, userId, env) {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error('Invalid user ID');
  }

  try {
    // Fetch from asset
    const pdfBuffer = await env.ASSETS.get(EVENT_CONFIG.assets.pdf, {
      type: 'arrayBuffer',
    });

    if (!pdfBuffer) {
      throw new Error('PDF asset not found');
    }

    const response = await telegramApi.sendDocument(userId, {
      document: pdfBuffer,
      filename: EVENT_CONFIG.assets.pdf,
      caption: 'برنامه سمپوزیوم',
    });

    if (!response || !response.ok) {
      throw new Error('Failed to send PDF via Telegram API');
    }

    return response.result;
  } catch (error) {
    console.error('PDF send error:', error);
    throw new Error(`Failed to send PDF: ${error.message}`);
  }
}

export default {
  sendPDFToUser,
};