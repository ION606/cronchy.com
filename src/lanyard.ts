const apiBase = "https://api.lanyard.rest/v1",
  webSocketBase = "wss://api.lanyard.rest/socket";

export default async function Lanyard(userId: string) {
  if (userId === undefined) throw new Error("Missing `userId` option.");
  const socket = ref(new WebSocket(webSocketBase));
  const activities = ref<Activity[]>();

  let key = "subscribe_to_id";
  if (typeof userId === "object") key = "subscribe_to_ids";

  function setupSocket() {
    socket.value.addEventListener("message", ({ data }: { data: any }) => {
      const { d: status, op } = JSON.parse(data);
      if (op === 0) activities.value = status.activities;
    });
    socket.value.addEventListener("open", () => {
      // Subscribe to ID(s)
      socket.value.send(
        JSON.stringify({
          op: 2,
          d: {
            [key]: userId,
          },
        })
      );
      socket.value.addEventListener("close", () => {
        socket.value = new WebSocket(webSocketBase);
        setupSocket();
      });

    });
  }
  setupSocket();

  setInterval(() => {
    if (socket.value.readyState)
      socket.value.send(
        JSON.stringify({
          op: 3,
        })
      );
  }, 25000);

  return { socket, activities };
}
export type Snowflake = `${bigint}`;
export interface ActivityData {
  spotify: Spotify | null;
  kv: Record<string, string>;
  listening_to_spotify: boolean;
  discord_user: DiscordUser;
  discord_status: "online" | "idle" | "dnd" | "offline";
  activities: Activity[];
  active_on_discord_web: boolean;
  active_on_discord_mobile: boolean;
  active_on_discord_desktop: boolean;
}

export interface Spotify {
  track_id: string | null;
  timestamps: Timestamps;
  song: string;
  artist: string;
  album_art_url: string | null;
  album: string;
}

export interface Timestamps {
  start: number;
  end: number;
}

export interface DiscordUser {
  username: string;
  public_flags: number;
  id: Snowflake;
  global_name: string | null;
  /**
   * @deprecated Use global_name instead.
   */
  display_name: string | null;
  discriminator: string;
  bot: boolean;
  avatar_decoration_data: {
    asset: string;
    sku_id: bigint;
  } | null;
  avatar: string | null;
}

export interface Activity {
  type: number;
  state: string;
  name: string;
  id: string;
  emoji?: Emoji;
  created_at: number;
  timestamps?: Timestamps;
  sync_id?: string;
  session_id?: string;
  party?: Party;
  flags?: number;
  details?: string;
  assets?: Assets;
  application_id: string;
  buttons: string[];
}

export interface Emoji {
  name: string;
  id: Snowflake;
  animated: boolean;
}

export interface Party {
  size: [number, number];
  id: string;
}

export interface Assets {
  small_text: string;
  small_image: string;
  large_text: string;
  large_image: string;
}
