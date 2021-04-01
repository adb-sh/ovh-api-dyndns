import {OvhApi} from './OvhApi.js';
import rest from 'superagent';

export class DynDnsBot{
  constructor({config}){
    this.config = config;
    this.dns = new OvhApi({credentials: config.ovhCredentials});
    this.lastIp = null;
  }

  async update(){
    let newIp = await this.getIp();
    if (newIp === this.lastIp) return;
    this.lastIp = newIp;
    this.config.records.forEach(record => {
      record.target = newIp;
      this.dns.updateRecord(record);
    });
  }
  setInterval(seconds = this.config.updateInterval, random = this.config.randomInterval){
    let handler = random
      ? (callback) => setTimeout(callback, Math.random()*seconds*1000)
      : (callback) => callback();
    this.interval = setInterval(handler(()=>this.update()), seconds*1000);
    this.update();
  }
  async getIp(){
    return await rest.get(this.config.ipApi).then(res => {
      return res.text;
    }).catch(console.error);
  }
}