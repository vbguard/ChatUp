const mongoose = require("mongoose");

const options = {
  dbUrl: "mongodb://127.0.0.1:27017/chatup"
};

module.exports = async function() {
  try {
    const connection = await mongoose.connect(options.dbUrl, {
      useCreateIndex: true,
      useFindAndModify: false,
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    if (connection) {
      console.log("DB connected on", connection.connections[0].host, "host");
      console.log("name db: ", connection.connections[0].name);
    }
  } catch (error) {
    console.error("MongoDB connection error: ", error);
    process.exit(1);
  }
};
