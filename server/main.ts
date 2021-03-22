import {serve} from "https://deno.land/std@0.87.0/http/server.ts";
import {acceptable as isAppRequest} from "https://deno.land/std@0.87.0/ws/mod.ts";
import site from './site.ts'
import app from './app.ts'
import client from './client.ts'

client()

for await (const req of serve({port: 1080})) {
  if (isAppRequest(req)) {
    app(req)
  } else {
    site(req)
  }
}
