require("dotenv").config();
require("express-async-errors");
const express = require("express");
const app = express();

const authRouter = require("./routes/auth");
const jobsRouter = require("./routes/jobs");

const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");

const YAML = require("yamljs");
const swaggerUI = require("swagger-ui-express");
const swaggerDocument = YAML.load("./swagger.yaml");

const connnectDB = require("./db/connect");
// error handler
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");
const authenticationMiddleare = require("./middleware/authentication");

app.use(express.json());

// extra packages
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  })
);

app.set("trust proxy", 1);
app.use(helmet());
app.use(cors());
app.use(xss());

// routes

app.get("/", (req, res) => {
  res.send('<h1>Jobs API</h1><a href="/api-docs">Documentation</a>');
});

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/jobs", authenticationMiddleare, jobsRouter);

// app.get("/", (req, res) => {
//   res.send("jobs api");
// });

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connnectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
