import rest from 'superagent';
import sha1 from 'sha1';
import readline from 'readline';

export class OvhApi{
  constructor({credentials}){
    this.credentials = credentials;
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
    console.log(`api request at ${path} =>`);
    console.log(header);
    console.log(body);
    let request = getMethod(rest)(`${this.baseUrl}${path}`);
    await Object.keys(header).forEach(key => request.set(key, header[key]));
    return await request.send(body).then(res => {
      console.log('api response =>');
      console.log(JSON.parse(res.text));
      return JSON.parse(res.text);
    }).catch(err => {
      console.error(err);
      return false;
    });
  }

  async sendSignedRequest({
    path,
    body={},
    getMethod=rest=>rest.get,
    header={accept: 'json'}
  }){
    if (!this.credentials.consumerKey) await this.getConsumerKey();
    let timestamp = await this.getApiTime();
    header['X-Ovh-Timestamp'] = timestamp;
    header['X-Ovh-Signature'] = await this.getSignature({
      method: getMethod(this.methods),
      query: this.baseUrl+path,
      body, timestamp
    });
    header['X-Ovh-Consumer'] = this.credentials.consumerKey;
    await this.sendRequest({path, body, getMethod, header});
  }

  async getSignature({method = 'GET', query, body='', timestamp}){
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
    await this.rl.question('continue? (Y/n)', () => {
      switch (input) {
        case 'n': process.exit(); break;
        default: return res.consumerKey;
      }
    });
  }

  async updateRecord({domain, subDomain, recordId, target, ttl = 3600}){
    return await this.sendSignedRequest({
      path: `/domain/zone/${domain}/record/${recordId}`,
      getMethod: rest=>rest.put,
      body: {subDomain, target, ttl}
    });
  }

  async getApiTime(){
    return await this.sendRequest({
      path: '/auth/time'
    });
  }
}