import { app } from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase } from "./database/connect.js";

async function bootstrap() {
  await connectDatabase();
  app.listen(env.PORT, () => {
    console.log(`Qivora API running on port ${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
