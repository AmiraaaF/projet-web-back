const connections: WebSocket[] = [];

export async function websocketHandler(ctx: any) {
  const { socket, response } = Deno.upgradeWebSocket(ctx.request);
  socket.onopen = () => connections.push(socket);
  socket.onmessage = (e) => connections.forEach(ws => ws.send(e.data));
  socket.onclose = () => connections.splice(connections.indexOf(socket), 1);
  ctx.response = response;
}