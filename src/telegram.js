/**
 * Telegram Bot API Wrapper
 * 
 * Minimal abstraction for Telegram API calls.
 * Handles HTTP requests and basic error handling.
 * All API calls go through this module.
 */

const TELEGRAM_API_URL = 'https://api.telegram.org/bot';

export class TelegramAPI {
  constructor(botToken) {
    if (!botToken || typeof botToken !== 'string') {
      throw new Error('Invalid bot token');
    }
    this.token = botToken;
  }

  /**
   * Make API request
   */
  async request(method, params = {}) {
    const url = `${TELEGRAM_API_URL}${this.token}/${method}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!data.ok) {
        throw new Error(`Telegram API error: ${data.description || 'Unknown error'}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed for ${method}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send message
   */
  async sendMessage(chatId, options = {}) {
    return this.request('sendMessage', {
      chat_id: chatId,
      ...options,
    });
  }

  /**
   * Send document
   */
  async sendDocument(chatId, options = {}) {
    return this.request('sendDocument', {
      chat_id: chatId,
      ...options,
    });
  }

  /**
   * Forward message
   */
  async forwardMessage(chatId, fromChatId, options = {}) {
    return this.request('forwardMessage', {
      chat_id: chatId,
      from_chat_id: fromChatId,
      ...options,
    });
  }

  /**
   * Get file info
   */
  async getFile(fileId) {
    return this.request('getFile', {
      file_id: fileId,
    });
  }

  /**
   * Edit message
   */
  async editMessageText(chatId, messageId, text, options = {}) {
    return this.request('editMessageText', {
      chat_id: chatId,
      message_id: messageId,
      text,
      ...options,
    });
  }

  /**
   * Answer callback query
   */
  async answerCallbackQuery(callbackQueryId, options = {}) {
    return this.request('answerCallbackQuery', {
      callback_query_id: callbackQueryId,
      ...options,
    });
  }

  /**
   * Set webhook
   */
  async setWebhook(url) {
    return this.request('setWebhook', {
      url,
      allowed_updates: ['message', 'callback_query'],
    });
  }

  /**
   * Get webhook info
   */
  async getWebhookInfo() {
    return this.request('getWebhookInfo');
  }
}

export default TelegramAPI;