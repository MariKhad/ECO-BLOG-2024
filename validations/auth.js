import { body } from "express-validator";

export const registerValidation = [
  body("email", "Неправильний формат електронної пошти").isEmail(),
  body("password", "Пароль повинен містити щонайменше 5 символів").isLength({
    min: 5,
  }),
  body(
    "fullname",
    "Вкажіть Ім'я, що складається принаймні з 3 символів"
  ).isLength({ min: 3 }),
  body("avatarUrl", "Неправильне посилання на аватарку").optional().isURL(),
];
