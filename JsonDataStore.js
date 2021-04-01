import fs from "fs";

export class JsonDataStore {
  constructor(path) {
    this.path = path;
    this.data = this.loadData(path);
    this.proxyHandler = {
      set: (target, key, value) => {
        console.log(`config changed: ${key} set from ${target[key]} to ${value}`);
        target[key] = value;
        this.storeData(this.data);
        return true;
      },
      get: (target, key) => {
        if (typeof target[key] === 'object') return new Proxy(target[key], this.proxyHandler);
        return target[key];
      }
    };
    this.proxy = new Proxy(this.data, this.proxyHandler);
  }

  storeData(data, path = this.path) {
    try {
      fs.writeFileSync(path, JSON.stringify(data));
    } catch (err) {
      console.error(err);
    }
  }
  loadData(path = this.path) {
    try {
      return JSON.parse(fs.readFileSync(path, 'utf8'));
    } catch (err) {
      console.error(err);
      return false;
    }
  }
  getData(){
    return this.data;
  }
  getSyncedData(){
    return this.proxy;
  }
}