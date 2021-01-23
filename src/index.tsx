import { configureDynamicPlatform } from "@credding/homebridge-jsx";
import { API, Logging } from "homebridge";
import { PLATFORM_NAME } from "./settings";
import { SonosApi, FavOnPlayer } from "./SonosApi";
import { SonosApiContext } from "./SonosApiContext";
import { SonosPlatform } from "./SonosPlatform";

type SonosConfig = {
  readonly clientKey: string;
  readonly clientSecret: string;
  readonly refreshToken: string;
  readonly useGroups: boolean;
};

const platformFactory = async (
  logger: Logging,
  { clientKey, clientSecret, refreshToken, useGroups }: SonosConfig
) => {
  const sonosApi = new SonosApi(clientKey, clientSecret, logger);
  await sonosApi.refreshToken(refreshToken);

  const { households } = await sonosApi.getHouseholds();
  const householdId = households[0].id;

  const { players, groups } = await sonosApi.getGroups(householdId);

  const favs = await sonosApi.getFavorites(householdId);

  logger.debug("Got favorites %s", JSON.stringify(favs, null, 2));

  const fp: FavOnPlayer[] = [];
  for (const fe of favs.items) {
    for (const pe of groups) {
      fp.push(new FavOnPlayer(fe.id, `${fe.name}`, pe.id));
    }
  }

  logger.debug("Got favorites speakers %s", JSON.stringify(fp, null, 2));

  return (
    <SonosApiContext.Provider value={sonosApi}>
      <SonosPlatform
        players={players}
        favs={fp}
        groups={groups}
        useGroups={useGroups}
      ></SonosPlatform>
    </SonosApiContext.Provider>
  );
};

export default (api: API): void => {
  api.registerPlatform(
    PLATFORM_NAME,
    configureDynamicPlatform(platformFactory)
  );
};
