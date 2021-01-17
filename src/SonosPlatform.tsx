import {
  Component,
  DynamicPlatform,
  DynamicPlatformConfiguration,
} from "@credding/homebridge-jsx";
import { PLATFORM_NAME, PLUGIN_IDENTIFIER } from "./settings";
import {  Player, FavOnPlayer  } from "./SonosApi";
import {  SonosPlayer, SonosFavoritePlayer } from "./SonosPlayer";

type SonosPlatformProps = {
  players: Player[];
  favs: FavOnPlayer[];
};


export const SonosPlatform = ({
  players,
  favs
}: SonosPlatformProps): Component<DynamicPlatformConfiguration> => {
  return (<DynamicPlatform
    pluginIdentifier={PLUGIN_IDENTIFIER}
    platformName={PLATFORM_NAME}
  >
    {
      favs.map((fp) => (
        <SonosFavoritePlayer {...fp}></SonosFavoritePlayer>
      )).concat(
        players.map((player) => (
        <SonosPlayer {...player}></SonosPlayer>
      )))
    }
  </DynamicPlatform>);
};
