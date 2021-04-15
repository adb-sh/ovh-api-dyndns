import rest from 'superagent';
import sha1 from 'sha1';
import readline from 'readline';

export class OvhApi{
  constructor({credentials, logs = true}){
    this.credentials = credentials;
    this.log = logs ? this.requestLogs : ()=>{};
    this.baseUrl = this.credentials.apiUrl;
    this.methods = {get: 'GET', post: 'POST', put: 'PUT', delete: 'DELETE', path: 'PATCH'};
    this.rl = readline.createInterface({
      input: process.stdin
    });
  }

  async sendRequest({
    path,
    body={},
    getMethod=rest=>rest.get,
    header={accept: 'json'}
  }){
    let request = getMethod(rest)(`${this.baseUrl}${path}`);
    await Object.keys(header).forEach(key => request.set(key, header[key]));
    return await request.send(body).then(res => {
      this.log({path, header, body, res: JSON.parse(res.text)});
      return JSON.parse(res.text);
    }).catch(err => {
      this.log({path, header, body, err: err?.response?.text});
      return false;
    });
  }

  requestLogs({path, header, body, res, err}){
    console.log(
      `\napi request at ${path} =>`,
      'header:', header,
      'body:', body,
      '\napi response =>'
    );
    console.assert(res) || console.error(err);
  }

  async sendSignedRequest({
    path,
    body={},
    getMethod=rest=>rest.get,
    header={accept: 'json'},
    timestamp = (Date.now()/1000).toFixed()
  }){
    header['X-Ovh-Timestamp'] = timestamp;
    header['X-Ovh-Consumer'] = this.credentials.consumerKey || await this.getConsumerKey();
    header['X-Ovh-Application'] = this.credentials.applicationKey;
    header['X-Ovh-Signature'] = this.getSignature({
      method: getMethod(this.methods),
      query: this.baseUrl+path,
      body: JSON.stringify(body),
      timestamp
    });
    return await this.sendRequest({path, body, getMethod, header});
  }

  getSignature({method = 'GET', query, body='', timestamp}){
    return '$1$' + sha1(
      this.credentials.applicationSecret+'+'+
      this.credentials.consumerKey+'+'+
      method+'+'+query+'+'+body+'+'+timestamp
    );
  }

  async getConsumerKey(){
    let res = await this.sendRequest({
      path: '/auth/credential',
      getMethod: rest=>rest.post,
      header: {
        'X-Ovh-Application': this.credentials.applicationKey,
        'Content-type': 'application/json'
      },
      body: {
        accessRules: [
          {method: 'GET', path: '/domain/zone/*'},
          {method: 'POST', path: '/domain/zone/*'},
          {method: 'PUT', path: '/domain/zone/*'}
        ]
      }
    });
    this.credentials.consumerKey = res.consumerKey;
    console.log('please validate on ovh site:');
    console.log(res.validationUrl);
    return this.rl.question('continue? (Y/n)', async (input) => {
      switch (input) {
        case 'n': process.exit(); break;
        default: return res.consumerKey;
      }
    });
  }

  async updateRecord({zone, subDomain, id, target, ttl = 3600, fieldType = 'A'}, domain = zone){
    return await this.sendSignedRequest({
      path: `/domain/zone/${domain}/record/${id}`,
      getMethod: rest=>rest.put,
      body: {subDomain, target, ttl}
    });
  }

  async getApiTime(){
    return await this.sendRequest({
      path: '/auth/time'
    });
  }

  async getRecords({domain, fieldType = undefined, subDomain = undefined}){
    return await this.sendSignedRequest({
      path: `/domain/zone/${domain}/record`,
      body: {
        fieldType,
        subDomain
      }
    });
  }

  async getRecord({domain, id}){
    return await this.sendSignedRequest({
      path: `/domain/zone/${domain}/record/${id}`
    });
  }

  async refreshZone(zone){
    return await this.sendSignedRequest({
      path: `/domain/zone/${zone}/refresh`,
      getMethod: rest=>rest.post
    });
  }
}