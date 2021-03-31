import {DynDnsBot} from './DynDnsBot.js';
import {loadData, storeData} from './jsonDataStore.js';

let configPath = 'config.json';
let config = loadData(configPath);

let configProxy = new Proxy(config, {
  set: (target, key, value) => {
    console.log(`config changed: ${key} set from ${target[key]} to ${value}`);
    target[key] = value;
    storeData(config, configPath);
    return true;
  }
});
let bot = new DynDnsBot({config: configProxy});
bot.setInterval();