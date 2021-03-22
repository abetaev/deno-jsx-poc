import {ServerRequest, Response} from "https://deno.land/std@0.87.0/http/server.ts";

const MIME_DATA: {[ext: string]: string} = {
  "html": "text/html",
  "js": "text/javascript",
  "ico": "image/png"
}

export default async function (req: ServerRequest) {
  const [, path,] = req.url.split('/')
  const file = `public/${path === "" ? "client.html" : `${path}`}`
  const headers = new Headers()
  try {
    const body = await Deno.open(file)
    headers.set("content-type", MIME_DATA[file.split(".").slice(-1)[0]])
    await req.respond({headers, body})
  } catch (error) {
    const {name} = error as {name: string};
    switch (name) {
      case "PermissionDenied":
        req.respond({status: 403})
        break;
      case "NotFound":
        req.respond({status: 404})
        break;
    }
  }
}

