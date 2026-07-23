import test from 'node:test';
import assert from 'node:assert/strict';

import { startCongress } from '../src/congress.js';
import { handleText } from '../src/handlers.js';
import { getUser, saveUser } from '../src/database.js';
import { STATES } from '../src/states.js';

function createBot() {
  const messages = [];
  return {
    messages,
    async sendMessage(chatId, text) {
      messages.push({ type: 'message', chatId, text });
    },
    async sendPhoto(chatId, photo, options) {
      messages.push({ type: 'photo', chatId, photo, options });
    },
    async sendDocument(chatId, document, options) {
      messages.push({ type: 'document', chatId, document, options });
    }
  };
}

test('startCongress sends the welcome message and moves to personal-info state', async () => {
  const bot = createBot();
  await startCongress(bot, 1001);

  assert.equal(bot.messages.length, 2);
  assert.match(bot.messages[0].text, /به سامانه ثبت نام خوش آمدید/);
  assert.match(bot.messages[1].text, /مرحله اول: اطلاعات شخصی/);

  const user = getUser(1001);
  assert.equal(user.state, STATES.GET_PERSONAL_INFO);
});

test('handleText parses a full personal-info message and advances to document step', async () => {
  const bot = createBot();
  saveUser(2002, { state: STATES.GET_PERSONAL_INFO });

  await handleText(bot, {
    chat: { id: 2002 },
    text: 'نام و نام خانوادگی: علی رضایی\nکد ملی: 1234567890\nرشته: ارتوز و پروتز\nمقطع: کارشناسی ارشد\nشماره همراه: 09120000000'
  });

  const user = getUser(2002);
  assert.equal(user.state, STATES.GET_DOCUMENT);
  assert.equal(user.name, 'علی رضایی');
  assert.equal(user.nationalId, '1234567890');
  assert.equal(user.field, 'ارتوز و پروتز');
  assert.equal(user.level, 'کارشناسی ارشد');
  assert.equal(user.phone, '09120000000');
  assert.match(bot.messages[0].text, /مرحله دوم: احراز هویت/);
});

test('handleText parses inline personal-info text with the same labels', async () => {
  const bot = createBot();
  saveUser(2003, { state: STATES.GET_PERSONAL_INFO });

  await handleText(bot, {
    chat: { id: 2003 },
    text: 'نام و نام خانوادگی: علی رضایی کد ملی: 1234567890 رشته: ارتوز و پروتز مقطع: کارشناسی ارشد شماره همراه: 09120000000'
  });

  const user = getUser(2003);
  assert.equal(user.state, STATES.GET_DOCUMENT);
  assert.equal(user.name, 'علی رضایی');
  assert.equal(user.nationalId, '1234567890');
  assert.equal(user.field, 'ارتوز و پروتز');
  assert.equal(user.level, 'کارشناسی ارشد');
  assert.equal(user.phone, '09120000000');
});
