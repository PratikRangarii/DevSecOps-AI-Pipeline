import "dotenv/config";
import app from "./app.js";
import connectDatabase from "./config/database.js";

const PORT = process.env.PORT || 7000;

const startServer = async () => {
  await connectDatabase();

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Dashboard API running on port ${PORT}`);
    console.log(
      `🔗 Health: http://localhost:${PORT}/api/health`
    );
  });

  const shutdown = (signal) => {
    console.log(`\n${signal} received. Shutting down...`);

    server.close(() => {
      console.log("✅ Server stopped");
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
};

startServer();
