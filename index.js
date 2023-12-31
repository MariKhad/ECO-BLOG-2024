import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { validationResult } from "express-validator";
import "express-async-errors"; // Додано для обробки асинхронних помилок

import { registerValidation } from "./validations/auth.js";

import UserModel from "./models/user.js";
import cheakAuth from "./utils/cheakAuth.js";

const PORT = 4444;
const MONGODB_URI =
  "mongodb+srv://markkozhydlo:mark2010@eko-blog.nlbzo5x.mongodb.net/blog?retryWrites=true&w=majority";

// Підключення до бази даних
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB успішно підключено!");
  })
  .catch((err) => {
    console.error("Помилка при підключенні до бази даних", err);
    throw err; // Замість process.exit(1)
  });

const app = express();

app.use(express.json());

// Оптимізовано підключення до бази даних
const connectToDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB успішно підключено!");
  } catch (err) {
    console.error("Помилка при підключенні до бази даних", err);
    throw err; // Замість process.exit(1)
  }
};

connectToDatabase();

app.post("/auth/login", async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        message: "Користувача не знайдено",
      });
    }

    const isValidPass = await bcrypt.compare(
      req.body.password,
      user.passwordHash
    );

    if (!isValidPass) {
      return res.status(401).json({
        // Змінено статус на 401
        message: "Неправильний логін або пароль",
      });
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      "mark2010",
      {
        expiresIn: "30d",
      }
    );

    const { passwordHash, ...userData } = user._doc;

    res.json({
      ...userData,
      token,
    });
  } catch (err) {
    next(err); // Додано передачу помилки в глобальний обробник помилок
  }
});

app.post("/auth/register", registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }

    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = new UserModel({
      email: req.body.email,
      fullname: req.body.fullname,
      avatarUrl: req.body.avatarUrl,
      passwordHash: hash,
    });

    await user.save();

    const token = jwt.sign(
      {
        _id: user._id,
      },
      "mark2010",
      {
        expiresIn: "30d",
      }
    );

    const { passwordHash, ...userData } = user._doc;

    res.json(userData);
  } catch (error) {
    console.error("Помилка при обробці запиту", error);
    res.status(500).json({ error: "Помилка сервера" });
  }
});

app.get("/auth/me", cheakAuth, async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "Користувача не знайдено",
      });
    }

    const { passwordHash, ...userData } = user._doc;

    res.json({
      ...userData,
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Немає доступу",
    });
  }
});

const startServer = async () => {
  try {
    await app.listen(PORT);
    console.log(`Сервер працює на порті ${PORT}`);
  } catch (err) {
    console.error("Помилка при запуску сервера", err);
    throw err;
  }
};

startServer();
