const express = require("express");
const Queue = require("bull");
const { createBullBoard } = require("@bull-board/api");
const { BullAdapter } = require("@bull-board/api/bullAdapter");
const { ExpressAdapter } = require("@bull-board/express");

require("dotenv").config({ path: "./.env.local" });
require("dotenv").config({ path: "./.env" });

const someQueue = new Queue("sync-organization", {
  redis: {
    port: parseInt(process.env.REDIS_PORT),
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
  },
});

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [new BullAdapter(someQueue)],
  serverAdapter: serverAdapter,
});

const app = express();

app.use("/admin/queues", serverAdapter.getRouter());

// other configurations of your server
const port = parseInt(process.env.PORT || "3002");

app.listen(port, () => {
  console.log(`Running on ${port}...`);
  console.log(`For the UI, open http://localhost:${port}/admin/queues`);
});
