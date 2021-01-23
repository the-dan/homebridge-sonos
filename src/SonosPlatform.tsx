import {
  Component,
  DynamicPlatform,
  DynamicPlatformConfiguration,
} from "@credding/homebridge-jsx";
import { PLATFORM_NAME, PLUGIN_IDENTIFIER } from "./settings";
import { Player, FavOnPlayer, Group } from "./SonosApi";
import {
  SonosPlayer,
  SonosFavoritePlayer,
  SonosGroupPlayer,
} from "./SonosPlayer";

type SonosPlatformProps = {
  players: Player[];
  favs: FavOnPlayer[];
  groups: Group[];
  useGroups: boolean;
};

export const SonosPlatform = ({
  players,
  favs,
  groups,
  useGroups,
}: SonosPlatformProps): Component<DynamicPlatformConfiguration> => {
  if (useGroups) {
    players = [];
  } else {
    groups = [];
  }

  return (
    <DynamicPlatform
      pluginIdentifier={PLUGIN_IDENTIFIER}
      platformName={PLATFORM_NAME}
    >
      {favs
        .map((fp) => <SonosFavoritePlayer {...fp}></SonosFavoritePlayer>)
        .concat(
          players.map((player) => <SonosPlayer {...player}></SonosPlayer>)
        )
        .concat(
          groups.map((group) => (
            <SonosGroupPlayer {...group}></SonosGroupPlayer>
          ))
        )}
    </DynamicPlatform>
  );
};
