const cron = require("node-cron");

console.log("Cron job sẽ bắt đầu...");

cron.schedule("* * * * *", () => {
  console.log("Cron job đang chạy mỗi phút...");
});
