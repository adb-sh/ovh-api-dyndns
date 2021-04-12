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
    Object.keys(this.config.records).forEach(domain => {
      Promise.all(this.config.records[domain].map(async record => {
        record.target = newIp;
        await this.dns.updateRecord(record, domain);
      })).then(() => this.dns.refreshZone(domain));
    })
  }
  setInterval(seconds = this.config.updateInterval, random = this.config.randomInterval){
    let handler = random
      ? () => setTimeout(()=>this.update(), Math.random()*seconds*1000)
      : () => this.update();
    this.interval = setInterval(handler, seconds*1000);
    this.update();
  }
  async getIp(){
    return await rest.get(this.config.ipApi).then(res => {
      return res.text;
    }).catch(console.error);
  }
}