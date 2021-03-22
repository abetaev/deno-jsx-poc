export type RelayMessage = {
  type: "data"
  from: string
  data: string
} | {
  type: "join" | "drop"
  id: string
}

export type PeerMessage = {
  to: string
  data: string
}
