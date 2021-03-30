import {DynDnsBot} from './DynDnsBot.js';
import {loadData} from './jsonDataStore.js';

let bot = new DynDnsBot({config: loadData('config.json')});
bot.setInterval();