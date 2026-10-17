import { MongoClient, type Db } from "mongodb";

const getUri = () => process.env.MONGODB_URI?.trim() || "";
const getDatabaseName = () => process.env.MONGODB_DB_NAME?.trim() || "paktijarat";
let clientPromise: Promise<MongoClient> | undefined;

export async function getMongoClient(): Promise<MongoClient> {
  const uri = getUri();
  if (!uri) {
    throw Object.assign(new Error("MONGODB_URI is not configured."), { status: 503 });
  }

  if (!clientPromise) {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      maxPoolSize: 10,
      minPoolSize: 0,
    });
    clientPromise = client.connect().catch((error) => {
      clientPromise = undefined;
      throw error;
    });
  }

  return clientPromise;
}

export async function getDatabase(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(getDatabaseName());
}
