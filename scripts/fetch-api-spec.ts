import fs from "fs";
import https from "https";
import http from "http";

const swaggerUrl = "http://localhost:3001/api/json";
const outputPath = "../frontend/src/integrations/api/api-spec.json";

function download(url: string, dest: string) {
  const client = url.startsWith("https") ? https : http;

  client
    .get(url, (res) => {
      if (res.statusCode !== 200) {
        console.error(`❌ Failed to fetch: ${res.statusCode}`);
        return;
      }

      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on("finish", () => {
        file.close();
        console.log(`✅ Swagger spec saved to ${dest}`);
      });
    })
    .on("error", (err) => {
      console.error("❌ Error downloading file:", err.message);
    });
}

download(swaggerUrl, outputPath);
