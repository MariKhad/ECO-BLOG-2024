// authMiddleware.js
import jwt from "jsonwebtoken";

export const checkAuth = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "Токен відсутній" });
  }

  try {
    const decodedToken = jwt.verify(token, "mark2010");
    req.userId = decodedToken._id;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Невірний токен" });
  }
};
