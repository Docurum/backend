import app from "./app";

// Server Configs
const PORT: number = Number(process.env.PORT) || 5000;
app.listen(PORT, () => {
  console.log(`🚀 @ http://localhost:${PORT}`);
});
