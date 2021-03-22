export default async function(): Promise<void> {

  let clientUpdated = true;

  function update() {
    if (clientUpdated) {
      Deno.run({cmd: ["deno", "bundle", "-c", "client/tsconfig.json", "client/main.tsx", "public/client.js"]})
      clientUpdated = false
    }
    setTimeout(update, 1000)
  }

  update();

  for await (const _ of Deno.watchFs("client")) {
    clientUpdated = true
  }

}
