import {h,render} from 'https://esm.sh/preact';
import Chat from './chat.tsx'

const url = new URL(document.URL)
const ws = new WebSocket(`${url.protocol === 'https' ? 'wss' : 'ws'}://${url.host}/`)

const App = () => (
  <Chat socket={ws} />
)


render(<App />, document.body);
