# Homebridge Sonos


Displays Sonos players and favorite playlists in Home app. This might be useful for automation. E.g. playing one of favorite playlist on arrival.


Sonos speakers control is implemented using using Sonos Cloud API.



Add following lines to the `~/.homebridge/config.json` or configure in Homebridge UI

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


[] It seems not possible to get which favorite playlist is playing now. This might lead to a wrong bulb being active in the Home app
[] Build non-faved speaker accessories per group instead of per player
[] On/Off player state maps to mute instead of play/pause
[] Use Smart Speaker instead of Light bulbs?
