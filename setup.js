import {JsonDataStore} from './JsonDataStore.js';
import {OvhApi} from "./OvhApi.js";

let store = new JsonDataStore('config.json').getSyncedData();

if (!store.ovhCredentials){
  console.log('ovhCredentials are undefined!');
  process.exit();
}
if (!store.ovhCredentials.applicationKey || !store.ovhCredentials.applicationSecret){
  console.log('applicationKey and/or applicationSecret are missing');
  process.exit();
}

let dns = new OvhApi({credentials: store.ovhCredentials, logs: false});

if (!store.ovhCredentials.consumerKey) await dns.getConsumerKey();

console.log('list all available records for defined domains =>');
Object.keys(store.records).forEach(domain => {
  dns.getRecords({domain}).then(ids => ids.forEach(id => {
    dns.getRecord({domain, id}).then(console.log);
  }));
});