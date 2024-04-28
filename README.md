# Info
Backend hosted on https://pert.azurewebsites.net

## Endpoints
### `GET /test`
Returns message when server is running 
```json
{
    "msg":"Yes, I\'m alive!"
}
```

### `POST /api/calculate`
Calculates crirical path of received model. Returns JSON with updated data

# Local setup
* get repository. Note - it is private repo but if you read it you have it :) 

      https://github.com/plpabla/pertool-back.git

* install dependencies

      npm install

* run

       npm start

By default, it will run on `http://localhost:3000`. To change a port, set environment variable `PORT`

      export PORT=6900