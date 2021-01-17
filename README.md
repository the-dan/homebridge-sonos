# Homebridge Sonos


Displays Sonos players and favorite playlists in Home app


Sonos speakers control is implemented using 
Controls Sonos speakers with HomeKit using Sonos Cloud API


Add following lines to the `~/.homebridge/config.json`:

```json
	"platforms": [
		{
			"platform": "sonos",
			"name": "Sonos",
			"clientKey": "<Sonos API client key>",
			"clientSecret": "<Sonos API client secret>",
			"refreshToken": "<Sonos API refresh token>"
		}
	]
```
