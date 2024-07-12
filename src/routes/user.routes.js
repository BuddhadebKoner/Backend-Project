import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import fs from "fs";

const router = Router();

router.route("/register").post(
  (req, res, next) => {
    try {
      upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
      ])(req, res, (err) => {
        if (err) {
          console.error("Error during file upload:", err);
          fs.appendFileSync('error.log', `Error during file upload: ${err}\n`);
          return res.status(500).send({ error: "File upload failed" });
        }
        next();
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      fs.appendFileSync('error.log', `Unexpected error: ${error}\n`);
      res.status(500).send({ error: "An unexpected error occurred" });
    }
  },
  registerUser
);

export default router;
