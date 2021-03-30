import rest from 'superagent';

export class OvhApi{
  async constructor({credentials}){
    this.credentials = credentials;
    this.baseUrl = credentials.apiUrl;
    this.apiToken = await this.getToken({applicationKey: credentials.applicationKey});
  }

  async sendRequest({
    path,
    obj={},
    method=rest=>rest.get,
    header={accept: 'json'}
  }){
    let request = method(rest)(`${this.baseUrl}${path}`);
    await Object.keys(header).forEach(key => request.set(key, header[key]));
    return await request.send(obj).then(res => {
      return JSON.parse(res.text);
    }).catch(err => {
      console.log(err);
      return false;
    });
  }

  async getToken({applicationKey}){
    return await this.sendRequest({
      path: '/auth/credential',
      method: rest=>rest.post,
      header: {
        'X-Ovh-Application': applicationKey,
        'Content-type': 'application/json'
      },
      obj: {
        accessRules: [
          {method: 'GET', path: '/domain/zone/*'},
          {method: 'POST', path: '/domain/zone/*'},
          {method: 'PUT', path: '/domain/zone/*'}
        ]
      }
    });
  }

  async updateRecord({domain, subDomain, recordId, target, ttl = 3600}){
    return await this.sendRequest({
      path: `/domain/zone/${domain}/record/${recordId}`,
      method: rest=>rest.put,
      obj: {
        subDomain,
        target,
        ttl
      }
    });
  }
}