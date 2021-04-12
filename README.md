# ovh-api-dyndns

a dyndns client for the ovh-api

This client does not use the ovh dynhost. Instead it updates the records by the ovh-api.

## setup
* copy `example.config.json` to `config.json`
* create an appToken at [api.ovh.com/createToken](https://api.ovh.com/createToken/?GET=/domain/zone/*&POST=/domain/zone/*&PUT=/domain/zone/*)
* insert the secrets you got from the site to `ovhCredentials` in `config.json` - `consumerKey` can also be updated by the setup scrip
* add all required domains/zoneNames to `records` in `config.json` - the array can be empty for now
* run `node setup.js` - if your ovhCredentials are correct, all availabe records will be listed
* add all required records to the array of the zoneName as shown in `example.config.json`
    * `updateInterval` and `ttl` should be similar and between 60 and 300 (seconds)
    * `subDomain` and `id` must be set
    * `fieldType` defaults to 'A'
    * `ttl` defaults to 3600
    * `target` will updated on IP change
* safe your config to `config.json.backup`

### run with docker-compose
```
docker-compose up -d
```

### run
```
node index.js
```