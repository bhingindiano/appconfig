# App config service

## Task

The following is a mock issue for an actual problem we've had. Your task is to
build a working rest api. We're looking for a minimum working example;
if the implementation is not specified, choose the simplest possible solution,
and focus on clean and readable code.

It has to be possible to run it on node v5.7.x on heroku, but other than that
the choice of technology is yours (including http server framework, any transpiler, etc).

You're expected to spend ~2 hours and produce on the order of ~200 lines of code.
When you're finished either send us a link to the code on github,
or a zip including the .git folder.

## Behavior

* An admin can store a key and a value for a specific app (client) and version
* A client can get all changed config fields since the last received change for a specific client and version

## Swagger spec (see http://swagger.io/specification/)

```yml
paths:
  /config/{client}/{version}:
    get:
      description: Get all changed config fields since the last received change for a specific client and version
      parameters:
        - name: client
          in: path
          type: string
          required: true
          description: Identifier for the client. E.g. "ios-m-omni"
        - name: version
          in: path
          type: string
          required: true
          description: Build version of the client. E.g. "267"
        - name: If-None-Match
          in: header
          type: string
          required: true
          description: The ETag of the last aquired config. E.g. W/"1"
        responses:
          304:
            description: No changed fields
          200:
            description: An object for each key that has a changed value
            schema:
              type: object
              example: '{"ads_endpoint": "/devads"}'

  /config:
    post:
      description:
      parameters:
        - name: body
          in: body
          required: true
          schema:
            $ref: "#/definitions/Config"
      responses:
        201:
          description: Created

definitions:
  Config:
    required:
      - client
      - version
      - key
      - value
    properties:
      client:
        type: string
      version:
        type: string
      key:
        type: string
      value:
        type: string
```

## Examples

POST /config
{"client": "ios", "version": "267", "key": "ads_endpoint", "value": "/devads"}
> 201 Created


GET /config/ios/267
> 200 OK
> ETag: w/"1"
> {"ads_endpoint": "/devads"}

GET /config/ios/266
> 304 Not Modified

GET /config/ios/268
> 304 Not Modified

GET /config/ios/267
If-None-Match: W/"1"
> 304 Not Modified

GET /config/android/267
> 304 Not Modified


POST /config
{"client": "ios", "version": "267", "key": "background_color", "value": "#000"}
> 201 Created


GET /config/ios/267
> 200 OK
> ETag: w/"2"
> {"ads_endpoint": "/devads", "background_color": "#000"}

GET /config/ios/267
If-None-Match: W/"1"
> 200 OK
> ETag: w/"2"
> {"background_color": "#000"}

GET /config/ios/267
If-None-Match: W/"2"
> 304 Not Modified
