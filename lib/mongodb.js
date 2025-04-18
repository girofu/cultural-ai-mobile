import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("請在環境變數中設定 MONGODB_URI");
}

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  // 在開發模式中使用全局變數，這樣熱重載不會重新建立連接
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // 在生產模式中為每個請求建立新的連接
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
