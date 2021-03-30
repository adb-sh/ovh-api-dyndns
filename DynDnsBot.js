import {OvhApi} from './OvhApi.js';
import rest from 'superagent';

export class DynDnsBot{
  constructor({config}){
    this.config = config;
    this.dns = new OvhApi({credentials: config.ovhCredentials});
    this.lastIp = null;
  }

  async update() {
    let newIp = await this.getIp();
    if (newIp === this.lastIp) return;
    this.lastIp = newIp;
    this.config.records.forEach(record => {
      record.target = newIp;
      this.dns.updateRecord(record);
    });
  }
  setInterval(seconds = this.config.updateInterval, random = this.config.randomInterval){
    this.interval = setInterval(random
      ?setTimeout(this.update, Math.random()*seconds*1000)
      :this.update,
    seconds*1000);
  }
  async getIp(){
    return await rest.get(this.config.ipApi).then(newIp => {
      return newIp;
    }).catch(console.error);
  }
}