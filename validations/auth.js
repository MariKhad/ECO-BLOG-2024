import { body } from "express-validator";

export const registerValidation = [
  body("email", "Неправильний формат пошти").isEmail(),
  body("password", "Пароль має бати мінімум 5 символів!").isLength({ min: 5 }),
  body("fullname", "Вкажіть Ім'я").isLength({ min: 3 }),
  body("avatarUrl", "Неправильне посилання на аватарку").optional().isURL(),
];
