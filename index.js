import {DynDnsBot} from './DynDnsBot.js';
import {JsonDataStore} from './JsonDataStore.js';

let store = new JsonDataStore('config.json');

let bot = new DynDnsBot({config: store.getSyncedData()});
bot.setInterval();