import {
  BooleanCharacteristic,
  Component,
  NumberCharacteristic,
  PlatformAccessory,
  PlatformAccessoryConfiguration,
  Service,
  useContext,
  useHomebridgeApi,
  useLogger,
} from "@credding/homebridge-jsx";
import { Categories } from "homebridge";
import { SonosApiContext } from "./SonosApiContext";
import { PlaybackState } from "./SonosApi";

type SonosSpeakerProps = {
  id: string;
  name: string;
};

type SonosFavSpeakerProps = {
  favId: string;
  name: string;
  groupId: string;
};

export const SonosFavoritePlayer = ({
  favId,
  name,
  groupId,
}: SonosFavSpeakerProps): Component<PlatformAccessoryConfiguration> => {
  const { hap } = useHomebridgeApi();
  const sonosApi = useContext(SonosApiContext);
  const logger = useLogger();

  const getPlaying = async () => {
    const ps = await sonosApi.getGroupPlaybackStatus(groupId);
    logger.debug("Got playback status %s", JSON.stringify(ps, null, 2));

    if ((await isPlaying()) && ps.playbackState == PlaybackState.Playing) {
      return true;
    }

    return false;
  };

  const isPlaying = async () => {
    const pbmd = await sonosApi.groupPlaybackMetadata(groupId);
    return sonosApi.isPlaying(favId, groupId, pbmd.container);
  };

  const setPlaying = async (value: boolean) => {
    if (value) {
      // desired state is "Playing"

      if (await isPlaying()) {
        // if requested favorite is playing already
        await sonosApi.groupPlay(groupId);
      } else {
        await sonosApi.playFavorite(favId, groupId);

        // XXX: assuming loadFavorite changes metadata before returning
        const pbmd = await sonosApi.groupPlaybackMetadata(groupId);
        logger.debug("Got playback metadata %s", JSON.stringify(pbmd, null, 2));

        const container = pbmd.container;
        sonosApi.nowPlaying(favId, groupId, container);
      }
    } else {
      // desired state is "paused"

      await sonosApi.groupPause(groupId);
    }
  };

  const getVolume = async () => {
    const { volume } = await sonosApi.getGroupVolume(groupId);
    return volume;
  };

  const setVolume = async (value: number) => {
    await sonosApi.setGroupVolume(groupId, value);
  };

  return (
    <PlatformAccessory
      name={name}
      uuid={hap.uuid.generate(favId + groupId)}
      category={Categories.SPEAKER}
    >
      <Service type={hap.Service.Lightbulb}>
        <BooleanCharacteristic
          type={hap.Characteristic.On}
          onGet={getPlaying}
          onSet={setPlaying}
        ></BooleanCharacteristic>
        <NumberCharacteristic
          type={hap.Characteristic.Brightness}
          onGet={getVolume}
          onSet={setVolume}
        ></NumberCharacteristic>
      </Service>
    </PlatformAccessory>
  );
};

export const SonosPlayer = ({
  id,
  name,
}: SonosSpeakerProps): Component<PlatformAccessoryConfiguration> => {
  const { hap } = useHomebridgeApi();
  const sonosApi = useContext(SonosApiContext);

  const getMuted = async () => {
    const { muted } = await sonosApi.getPlayerVolume(id);
    return muted;
  };
  const setMuted = async (value: boolean) => {
    await sonosApi.setPlayerMute(id, value);
  };

  const getVolume = async () => {
    const { volume } = await sonosApi.getPlayerVolume(id);
    return volume;
  };
  const setVolume = async (value: number) => {
    await sonosApi.setPlayerVolume(id, value);
  };

  return (
    <PlatformAccessory
      name={name}
      uuid={hap.uuid.generate(id)}
      category={Categories.SPEAKER}
    >
      <Service type={hap.Service.Lightbulb}>
        <BooleanCharacteristic
          type={hap.Characteristic.On}
          onGet={getMuted}
          onSet={setMuted}
        ></BooleanCharacteristic>
        <NumberCharacteristic
          type={hap.Characteristic.Brightness}
          onGet={getVolume}
          onSet={setVolume}
        ></NumberCharacteristic>
      </Service>
    </PlatformAccessory>
  );
};
