const express = require("express");
// require("dotenv").config();
const { router: authRoutes } = require("./routes/authRoutes");

const app = express();
app.use(express.json()); 

app.use("/", authRoutes);

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});
