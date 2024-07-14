import { User } from "../models/user.model.js";
import { asyncHandaller } from "../utils/asyncHandeller.js";
import jwt from "jsonwebtoken";

export const varifyJWT = asyncHandaller(async (req, _, next) => {
   try {
      const token =
         req.cookies?.accessToken ||
         req.headers("Authorization")?.replace("Bearer ", "");
      if (!token) {
         throw new ApiError(401, "Unauthenticated request");
      }

      const decodedToken = jwt.varify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decodedToken?._id).select(
         "-password -refreshToken"
      );

      if (!user) {
         throw new ApiError(401, "invalid access token");
      }

      req.user = user;
      next();
   } catch (error) {
      throw new ApiError(401, error?.message || "invalid access token");
   }
});
