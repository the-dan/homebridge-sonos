import { API } from "homebridge";
import { PLATFORM_NAME } from "./settings";
import { SonosPlatform } from "./SonosPlatform";

export default (api: API) => {
  api.registerPlatform(PLATFORM_NAME, SonosPlatform);
};
