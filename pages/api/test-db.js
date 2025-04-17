import dbConnect from "../../lib/mongodb.js";

async function testConnection() {
  try {
    await dbConnect();
    console.log("成功連接到 MongoDB!");
  } catch (error) {
    console.error("連接失敗:", error);
  }
}

testConnection();
