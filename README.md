# detoxifier-extension
Link https://devpost.com/software/detoxifier-just-a-better-twitter

## Architecture
![arch](https://github.com/DeluxeOwl/detoxifier-extension/blob/main/unknown.png)
## Frontend

1. download this repo
2. go to `chrome://extensions`
3. check `Developer mode` in the top right corner
4. click `Load unpacked`
5. select this repository

## Backend

### Toxic Classifier

1. clone IBM's [MAX-Toxic-Comment-Classifier](https://github.com/IBM/MAX-Toxic-Comment-Classifier)
2. start the docker container as shown in the link above
3. you can host it on your domain with https (required), if you don't have a domain:
4. use a reverse proxy, I used caddy with the following `Caddyfile`
```
:2021
reverse_proxy 127.0.0.1:5000 {
    header_down Access-Control-Allow-Headers *
    header_down Access-Control-Allow-Origin *
}
```
5. use a tunnel, for this project, I used ngrok for automatic https `./ngrok http 2021` (2021 - the port above)

### Fake news serverr
[Clone the detoxifier server](https://github.com/calinbiberea/detoxifier-server) and host it using the above method, or on netlify, 
as it isn't as resource intensive as the toxic classifier server.
