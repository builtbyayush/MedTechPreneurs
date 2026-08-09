import type { Options } from "pusher-js";

/** Shared Pusher client options — keeps auth cookies on same-origin requests. */
export function getPusherClientOptions(key: string, cluster: string): Options {
  return {
    cluster,
    channelAuthorization: {
      transport: "ajax",
      endpoint: "/api/pusher/auth",
    },
    // Deprecated alias kept for older pusher-js code paths.
    authEndpoint: "/api/pusher/auth",
    authTransport: "ajax",
  };
}
