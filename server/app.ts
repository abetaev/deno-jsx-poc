import {ServerRequest} from "https://deno.land/std@0.87.0/http/server.ts";
import {acceptWebSocket, isWebSocketCloseEvent, isWebSocketPingEvent, isWebSocketPongEvent, WebSocket} from "https://deno.land/std@0.87.0/ws/mod.ts";
import {v4 as uuid} from "https://deno.land/std@0.87.0/uuid/mod.ts";
import {Hash} from "https://deno.land/x/checksum@1.2.0/mod.ts";

import {PeerMessage, RelayMessage} from '../proto/base.ts'

const hash = new Hash("sha1")

const peers: {[id: string]: WebSocket} = {}

function handlePeerMessage(sourceId: string, message: PeerMessage) {
  const {to, data} = message;
  const target = peers[to]
  if (!target) {
    console.log(`undeliverable message`)
    return
  }
  console.log(message)
  target.send(JSON.stringify({
    type: "data",
    from: sourceId,
    data
  }))
}

function handleNewPeer(id: string, ws: WebSocket) {
  console.log(`adding new peer ${id}`)
  peers[id] = ws;
  const oldPeerIds = Object.keys(peers)
    .filter(peerId => peerId !== id)
  const newPeer = peers[id];
  oldPeerIds.forEach(oldPeerId => {
    console.log(`old peer: ${oldPeerId}`)
    peers[oldPeerId].send(JSON.stringify({type: "join", id}))
    newPeer.send(JSON.stringify({type: "join", id: oldPeerId}))
  })
  console.log(`peer ${id} added`)
}

function handlePeerDrop(id: string) {
  console.log(`dropping peer ${id}`)
  delete peers[id]
  Object.values(peers)
    .forEach(peer => peer.send(JSON.stringify({type: "drop", id})))
  console.log(`peer ${id} dropped`)
}

export default async function ({conn, r: bufReader, w: bufWriter, headers}: ServerRequest) {

  const ws = await acceptWebSocket({
    conn,
    bufReader,
    bufWriter,
    headers,
  });


  const id = uuid.generate();
  handleNewPeer(id, ws);

  for await (const e of ws) {
    if (typeof e === "string") {
      handlePeerMessage(id, JSON.parse(e));
    } else if (e instanceof Uint8Array) {
      console.log('received binary data')
    } else if (isWebSocketPingEvent(e)) {
      console.log('received ping')
    } else if (isWebSocketPongEvent(e)) {
      console.log('received pong')
    } else if (isWebSocketCloseEvent(e)) {
      handlePeerDrop(id);
    } else {
      console.log('unknown event')
    }
  }

}
