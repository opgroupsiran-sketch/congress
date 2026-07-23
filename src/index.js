import { Router } from 'itty-router';

const router = Router();

// User states in memory (برای production باید DB استفاده کن)
const userStates = new Map();

/**
 * POST /webhook - Telegram webhook endpoint
 */
router.post('/webhook', async (request, env) => {
  try {
    const update = await request.json();
    console.log('Webhook received:', JSON.stringify(update, null, 2));

    if (update.message) {
      const message = update.message;
      const chatId = message.chat.id;
      const userId = message.from.id;
      const text = message.text || '';

      // Get or create user state
      let userState = userStates.get(userId) || { step: 'initial' };

      console.log(`User ${userId} at step: ${userState.step}, message: ${text}`);

      // State machine
      switch (userState.step) {
        case 'initial':
          if (text === '/start') {
            await sendMessage(env, chatId, '👋 خوش آمدید!\n\nلطفا نام خود را وارد کنید:');
            userState.step = 'asking_name';
            userStates.set(userId, userState);
          }
          break;

        case 'asking_name':
          userState.name = text;
          await sendMessage(env, chatId, `✅ نام: ${text}\n\nلطفا شماره تلفن خود را وارد کنید:`);
          userState.step = 'asking_phone';
          userStates.set(userId, userState);
          break;

        case 'asking_phone':
          userState.phone = text;
          await sendMessage(env, chatId, `✅ شماره تلفن: ${text}\n\nلطفا ایمیل خود را وارد کنید:`);
          userState.step = 'asking_email';
          userStates.set(userId, userState);
          break;

        case 'asking_email':
          userState.email = text;
          const summary = `📋 خلاصه ثبت نام:\n\n👤 نام: ${userState.name}\n📞 تلفن: ${userState.phone}\n📧 ایمیل: ${text}\n\nتایید می‌کنید؟ (بله/خیر)`;
          await sendMessage(env, chatId, summary);
          userState.step = 'asking_confirmation';
          userStates.set(userId, userState);
          break;

        case 'asking_confirmation':
          if (text === 'بله' || text === 'yes') {
            // Save to database (later)
            await sendMessage(env, chatId, '✅ ثبت نام شما با موفقیت انجام شد!\n\n🎉 شما آماده حضور در کنگره هستید.');
            userState.step = 'completed';
            userStates.set(userId, userState);
          } else if (text === 'خیر' || text === 'no') {
            await sendMessage(env, chatId, 'لطفا نام خود را دوباره وارد کنید:');
            userState.step = 'asking_name';
            userStates.set(userId, userState);
          }
          break;

        case 'completed':
          if (text === '/start') {
            await sendMessage(env, chatId, '✅ شما قبلا ثبت نام کرده‌اید!\n\n/status - وضعیت ثبت نام\n/help - راهنما');
          } else {
            await sendMessage(env, chatId, '✅ شما قبلا ثبت نام کرده‌اید!');
          }
          break;

        default:
          if (text === '/help') {
            await sendMessage(env, chatId, `📋 دستورات:\n/start - شروع ثبت نام\n/status - وضعیت\n/help - راهنما`);
          } else {
            await sendMessage(env, chatId, 'لطفا /start بزنید برای شروع.');
          }
      }
    }

    return jsonResponse({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return jsonResponse({ error: error.message }, 500);
  }
});

/**
 * Send message to Telegram
 */
async function sendMessage(env, chatId, text) {
  try {
    const token = env.TELEGRAM_BOT_TOKEN;
    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();
    console.log('Message sent:', data);
    return data;
  } catch (error) {
    console.error('Send message error:', error);
  }
}

/**
 * GET /health
 */
router.get('/health', async (request, env) => {
  return jsonResponse({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /
 */
router.get('/', () => {
  return jsonResponse({
    name: 'Congress Bot',
    version: '1.0.0',
    status: 'running',
  });
});

/**
 * 404
 */
router.all('*', () => {
  return jsonResponse({ error: 'Not found' }, 404);
});

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export default {
  async fetch(request, env, ctx) {
    return router.handle(request, env, ctx);
  },
};