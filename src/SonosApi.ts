import fetch, { Response } from "node-fetch";
import { URLSearchParams } from "url";

import { Logging } from "homebridge";

const SONOS_AUTHORIZATION_API = "https://api.sonos.com/login/v3";
const SONOS_CONTROL_API = "https://api.ws.sonos.com/control/api/v1";

const CONTENT_TYPE_JSON_HEADER = ["Content-Type", "application/json"];

export class FavOnPlayer {
  constructor(
    readonly favId: string,
    readonly name: string,
    readonly groupId: string
  ) {}
}

export class SonosApi {
  private accessToken = "";
  private lastPlayedFavoriteId = "";

  constructor(
    private clientKey: string,
    private clientSecret: string,
    private logger: Logging
  ) {}

  async createToken(
    authorizationCode: string,
    redirectUri: string
  ): Promise<RefreshTokenResponse> {
    const endpoint = `${SONOS_AUTHORIZATION_API}/oauth/access`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: [this.getBasicAuthorizationHeader()],
      body: new URLSearchParams([
        ["grant_type", "authorization_code"],
        ["code", authorizationCode],
        ["redirect_uri", redirectUri],
      ]),
    });

    const {
      access_token: accessToken,
      expires_in: expiresIn,
      refresh_token: refreshToken,
    }: AuthorizationApiTokenResponse = await getSuccessfulResponseJson(
      response
    );

    this.accessToken = accessToken;
    this.logger.debug("Access token %s", accessToken);
    return { expiresIn, refreshToken };
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const endpoint = `${SONOS_AUTHORIZATION_API}/oauth/access`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: [this.getBasicAuthorizationHeader()],
      body: new URLSearchParams([
        ["grant_type", "refresh_token"],
        ["refresh_token", refreshToken],
      ]),
    });

    const {
      access_token: accessToken,
      expires_in: expiresIn,
      refresh_token: newRefreshToken,
    }: AuthorizationApiTokenResponse = await getSuccessfulResponseJson(
      response
    );

    this.accessToken = accessToken;
    this.logger.debug("Refreshed Access token %s", accessToken);
    return { expiresIn, refreshToken: newRefreshToken };
  }

  async getHouseholds(): Promise<HouseholdsResponse> {
    const endpoint = `${SONOS_CONTROL_API}/households`;
    const response = await fetch(endpoint, {
      headers: [this.getBearerAuthorizationHeader()],
    });
    return await getSuccessfulResponseJson(response);
  }

  async getGroups(householdId: string): Promise<GroupsResponse> {
    const endpoint = `${SONOS_CONTROL_API}/households/${householdId}/groups`;
    const response = await fetch(endpoint, {
      headers: [this.getBearerAuthorizationHeader()],
    });
    return await getSuccessfulResponseJson(response);
  }

  async getFavorites(householdId: string): Promise<FavoritesResponse> {
    const endpoint = `${SONOS_CONTROL_API}/households/${householdId}/favorites`;
    const response = await fetch(endpoint, {
      headers: [this.getBearerAuthorizationHeader()],
    });
    return await getSuccessfulResponseJson(response);
  }

  async getPlayerVolume(playerId: string): Promise<PlayerVolume> {
    const endpoint = `${SONOS_CONTROL_API}/players/${playerId}/playerVolume`;
    const response = await fetch(endpoint, {
      headers: [this.getBearerAuthorizationHeader()],
    });
    return await getSuccessfulResponseJson(response);
  }

  async getGroupVolume(groupId: string): Promise<PlayerVolume> {
    const endpoint = `${SONOS_CONTROL_API}/groups/${groupId}/groupVolume`;
    const response = await fetch(endpoint, {
      headers: [this.getBearerAuthorizationHeader()],
    });
    return await getSuccessfulResponseJson(response);
  }

  async getGroupPlaybackStatus(groupId: string): Promise<PlaybackStatus> {
    const endpoint = `${SONOS_CONTROL_API}/groups/${groupId}/playback`;
    const response = await fetch(endpoint, {
      headers: [this.getBearerAuthorizationHeader()],
    });
    return await getSuccessfulResponseJson(response);
  }

  async groupPause(groupId: string): Promise<void> {
    const endpoint = `${SONOS_CONTROL_API}/groups/${groupId}/playback/pause`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: [this.getBearerAuthorizationHeader(), CONTENT_TYPE_JSON_HEADER],
    });
    return await getSuccessfulResponseJson(response);
  }

  async groupPlay(groupId: string): Promise<void> {
    const endpoint = `${SONOS_CONTROL_API}/groups/${groupId}/playback/play`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: [this.getBearerAuthorizationHeader(), CONTENT_TYPE_JSON_HEADER],
    });
    return await getSuccessfulResponseJson(response);
  }

  async groupPlaybackMetadata(groupId: string): Promise<PlaybackMetadata> {
    const endpoint = `${SONOS_CONTROL_API}/groups/${groupId}/playbackMetadata`;
    const response = await fetch(endpoint, {
      headers: [this.getBearerAuthorizationHeader()],
    });
    return await getSuccessfulResponseJson(response);
  }

  async setPlayerVolume(
    playerId: string,
    volume: number,
    muted?: boolean
  ): Promise<PlayerVolume> {
    const endpoint = `${SONOS_CONTROL_API}/players/${playerId}/playerVolume`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: [this.getBearerAuthorizationHeader(), CONTENT_TYPE_JSON_HEADER],
      body: JSON.stringify({ volume, muted }),
    });
    return await getSuccessfulResponseJson(response);
  }

  async setGroupVolume(
    groupId: string,
    volume: number,
    muted?: boolean
  ): Promise<PlayerVolume> {
    const endpoint = `${SONOS_CONTROL_API}/groups/${groupId}/groupVolume`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: [this.getBearerAuthorizationHeader(), CONTENT_TYPE_JSON_HEADER],
      body: JSON.stringify({ volume, muted }),
    });
    return await getSuccessfulResponseJson(response);
  }

  async setPlayerMute(playerId: string, muted: boolean): Promise<PlayerVolume> {
    const endpoint = `${SONOS_CONTROL_API}/players/${playerId}/playerVolume/mute`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: [this.getBearerAuthorizationHeader(), CONTENT_TYPE_JSON_HEADER],
      body: JSON.stringify({ muted }),
    });
    return await getSuccessfulResponseJson(response);
  }

  async setGroupMute(groupId: string, muted: boolean): Promise<PlayerVolume> {
    const endpoint = `${SONOS_CONTROL_API}/groups/${groupId}/groupVolume/mute`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: [this.getBearerAuthorizationHeader(), CONTENT_TYPE_JSON_HEADER],
      body: JSON.stringify({ muted }),
    });
    return await getSuccessfulResponseJson(response);
  }

  public isFavoriteLoaded(favId: string): boolean {
    return this.lastPlayedFavoriteId == favId;
  }

  async playFavorite(favId: string, groupId: string): Promise<void> {
    const endpoint = `${SONOS_CONTROL_API}/groups/${groupId}/favorites`;

    const req = {
      favoriteId: favId,
      playOnCompletion: true,
      playModes: { shuffle: true },
      action: "REPLACE",
    };

    this.logger.debug("Request %s", JSON.stringify(req));

    const response = await fetch(endpoint, {
      method: "POST",
      headers: [this.getBearerAuthorizationHeader(), CONTENT_TYPE_JSON_HEADER],
      body: JSON.stringify(req),
    });
    await getSuccessfulResponseJson(response);

    this.lastPlayedFavoriteId = favId;
  }

  private getBasicAuthorizationHeader(): [string, string] {
    const credentials = Buffer.from(
      `${this.clientKey}:${this.clientSecret}`
    ).toString("base64");

    return ["Authorization", `Basic ${credentials}`];
  }

  private getBearerAuthorizationHeader(): [string, string] {
    return ["Authorization", `Bearer ${this.accessToken}`];
  }
}

export class StatusCodeError extends Error {
  constructor(status: number) {
    super(`Status code: ${status}`);
  }
}

export type RefreshTokenResponse = {
  refreshToken: string;
  expiresIn: number;
};

export type HouseholdsResponse = {
  households: Household[];
};

export type Household = {
  id: string;
  name: string;
};

export type GroupsResponse = {
  groups: Group[];
  players: Player[];
  partial: boolean;
};

export type Group = {
  id: string;
  name: string;
  playbackState: PlaybackStatus;
  coordinatorId: string;
  playerIds: string[];
};

export type FavoritesResponse = {
  version: string;
  items: Favorite[];
};

export type Favorite = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  images: Image[];
  service: Service;
};

export type PlaybackStatus = {
  playbackState: string;
  queueVersion: string;
  itemId: string;
  positionMillis: number;
  playModes: PlayModes;
  availablePlaybackActions: PlaybackActions;
};

export type PlaybackMetadata = {
  container: Container;
  currentItem: Record<string, unknown>;
  nextItem: Record<string, unknown>;
  streamInfo: string;
};

export type ContainerId = {
  serviceId: string;
  objectId: string;
  accountId: string;
};

export type ContainerService = {
  name: string;
};

export type Container = {
  name: string;
  type: string;
  id: ContainerId;
  service: ContainerService;
  imageUrl: string;
  tags: string[];
};

export type PlayModes = {
  repeat: boolean;
  repeatOne: boolean;
  crossfade: boolean;
  shuffle: boolean;
};

export type PlaybackActions = {
  canSkip: boolean;
  canSkipBack: boolean;
  canSeek: boolean;
  canRepeat: boolean;
  canRepeatOne: boolean;
  canCrossfade: boolean;
  canShuffle: boolean;
};

export type Image = {
  url: string;
  height: number;
  width: number;
};

export type Service = {
  name: string;
  id: string;
  images: Image[];
};

export type Player = {
  id: string;
  name: string;
  icon: string;
  websocketUrl: string;
  softwareVersion: string;
  apiVersion: string;
  minApiVersion: string;
  capabilities: Capability[];
  deviceIds: string[];
};

export type PlayerVolume = {
  volume: number;
  muted: boolean;
  fixed: boolean;
};

export const enum PlaybackState {
  Idle = "PLAYBACK_STATE_IDLE",
  Buffering = "PLAYBACK_STATE_BUFFERING",
  Playing = "PLAYBACK_STATE_PLAYING",
  Paused = "PLAYBACK_STATE_PAUSED",
}

export const enum Capability {
  Playback = "PLAYBACK",
  Cloud = "CLOUD",
  HtPlayback = "HT_PLAYBACK",
  HtPowerState = "HT_POWER_STATE",
  Airplay = "AIRPLAY",
  LineIn = "LINE_IN",
  AudioClip = "AUDIO_CLIP",
  Voice = "VOICE",
  SpeakerDetection = "SPEAKER_DETECTION",
  FixedVolume = "FIXED_VOLUME",
}

type AuthorizationApiTokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
};

async function getSuccessfulResponseJson<TResponse>(
  response: Response
): Promise<TResponse> {
  if (response.status >= 400) {
    console.log(await response.json());
    throw new StatusCodeError(response.status);
  }
  return (await response.json()) as TResponse;
}
