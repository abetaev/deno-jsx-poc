import {h} from 'https://esm.sh/preact'
import {Reducer, useReducer} from 'https://esm.sh/preact/hooks'

import {RelayMessage} from '../proto/base.ts'

type Peer = {id: string}

type PeersListProps = {data: Peer[]}
const PeersList = ({data}: PeersListProps) => (
  <div>
    {data.map(({id}) => <div>{id}</div>)}
  </div>
)

type Message = {from: string, text: string}
type MessageProps = {data: Message}
const Message = ({data: {from, text}}: MessageProps) => (
  <div>
    <div>{from}:</div>
    <div>{text}</div>
  </div>
)
type MessageListProps = {data: Message[]}
const MessageList = ({data}: MessageListProps) => (
  <div>
    {data.map((message) => <Message data={message} />)}
  </div>
)

type ChatState = {
  peers: Peer[]
  messages: Message[]
}
type ChatProps = {socket: WebSocket}
const Chat = ({socket}: ChatProps) => {

  const [chat, handleRelayMessage] = useReducer<ChatState, RelayMessage>(({peers, messages}, message) => {
    switch (message.type) {
      case "join":
        peers.push({id: message.id})
        break;
      case "drop":
        peers = peers.filter(peer => peer.id !== message.id);
        break;
      case "data":
        messages.push({from: message.from, text: message.data})
        break;
    }
    return {peers, messages}
  }, {peers: [], messages: []})

  socket.onmessage = (message) => handleRelayMessage(JSON.parse(message.data))

  console.log(`render!`)

  return (
    <div className="chat">
      <PeersList data={chat.peers} />
      <MessageList data={chat.messages} />
      <button onClick={() => chat.peers.forEach(({id}) => socket.send(JSON.stringify({to: id, data: 'hello'})))}>send something</button>
    </div>
  )
}

export default Chat