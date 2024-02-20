const apiBase = "https://api.lanyard.rest/v1",
  webSocketBase = "wss://api.lanyard.rest/socket";

export default async function Lanyard(userId: string, socket?: boolean) {
  console.log(window);
  //   const supportsWebSocket = "WebSocket" in document || "MozWebSocket" in document;

  //   if (socket === true && supportsWebSocket === false)
  //     throw new Error("Browser doesn't support WebSocket connections.");
  // Throw error if userId is missing.
  if (userId === undefined) throw new Error("Missing `userId` option.");
  // Use websocket if socket option is set to true.
  else if (socket === true) {
    const socket = new WebSocket(webSocketBase);

    let key = "subscribe_to_id";
    if (typeof userId === "object") key = "subscribe_to_ids";

    socket.addEventListener("open", () => {
      // Subscribe to ID(s)
      socket.send(
        JSON.stringify({
          op: 2,
          d: {
            [key]: userId,
          },
        })
      );

      // Send heartbeat every 30 seconds
      setInterval(() => {
        socket.send(
          JSON.stringify({
            op: 3,
          })
        );
      }, 30000);
    });

    return socket;
  }
  // Send a single request if userId is a string
  else if (typeof userId === "string") {
    return await fetch(`${apiBase}/users/${userId}`).then((res) => res.json());
  }
}
