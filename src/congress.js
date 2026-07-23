import { STATES } from "./states.js";
import { MESSAGES } from "./messages.js";
import { saveUser } from "./database.js";

export async function startCongress(bot, chatId) {

    saveUser(chatId, {
        state: STATES.GET_PERSONAL_INFO,
        verified: false,
        payment: false,
        document: null,
        receipt: null
    });

    await bot.sendMessage(chatId, MESSAGES.welcome);

    await bot.sendMessage(chatId, MESSAGES.personalInfo);

    return {
        state: STATES.GET_PERSONAL_INFO
    };
}