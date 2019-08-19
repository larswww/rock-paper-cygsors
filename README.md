# rock-paper-cygsors

take-home coding challenge; REST API


### Usage
Please note requires Node 8 and higher due to ES6 syntax w/o babel!
```$xslt
1. git clone https://github.com/larswww/rock-paper-cygsors.git && cd rock-paper-cygsors
2. npm install
3. npm run start
```


### Tests
```$xslt
(make sure the app isn't already running)
- npm run test (intergration and unit)
OR
- npm run unit (unit only)
- npm run e2e (intergration only)
```

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/380e0e3fb992c2f61e61)

### Curl Commands
```$xslt
curl -H "Content-Type: application/json" -d '{"name":"Lars", "move":"rock"}' http://localhost:3000/api/games

(Don't forget to replace the id with id return from first call in subsequent two calls)
curl -X PUT -H "Content-Type: application/json" -d '{"name":"Pete", "move":"paper"}' http://localhost:3000/api/games/ee38d234-1c42-4771-96bc-b65f699aa2ad/move
curl http://localhost:3000/api/games/ee38d234-1c42-4771-96bc-b65f699aa2ad

```

### Endpoints
In short I simplified the original requirements into 3 calls. Endpoints will return REST compliant status codes and headers.

```$xslt 
POST /api/games
- payload: {name: 'Lars', move: 'rock'} (required)
```

```$xslt 
PUT /api/games/{id}/move
- payload: {name: 'Steve', move: 'rock'} (required)
```

```$xslt 
GET /api/games/{id}
```



### Direct Dependencies

* Web Framework: [Fastify](https://www.fastify.io/) and [Fastify-rate-limit](https://github.com/fastify/fastify-helmet) plugin
* [UUID](https://www.npmjs.com/package/uuid) (v4)
* In-memory store: [Keyv](https://www.npmjs.com/package/keyv) 
* Implemented Rock Paper Scissors as my own separate npm module [Sten-Sax-Pase](https://www.npmjs.com/package/sten-sax-pase)

#### Dev dependencies
* Testing with [Mocha](https://mochajs.org/) using [Chai](https://www.chaijs.com/) for assertions and [Chai-Http](https://www.chaijs.com/plugins/chai-http/)
 plugin for simple intergration tests
* [Javascript Standard Style](https://www.npmjs.com/package/standard) for linting
 
### Structure

```$xslt
├── src  
│   ├── resources
│   │   └── games
│   │       ├── model.js
│   │       ├── api.js
│   │       ├── dao.js              
│   │       ├── router.js
│   │       └── schema.js           
│   └── server.js                   
│   └── index.js                    
└── test
    └── games
        ├── intergration.test.js
        └── unit.test.js
```



