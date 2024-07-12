import { asyncHandaller } from "../utils/asyncHandeller.js";
import { ApiError } from "./../utils/ApiError.js";
import { User } from "./../models/user.model.js";
import { uploadOnCloudinary } from "./../utils/cloudinary.js";
import { ApiResponce } from "./../utils/Apiresponce.js";

const registerUser = asyncHandaller(async (req, res) => {
   /*
   1.get user details from frontend
   2.validation of user details , not empty, email format
   3.check if user already exists , email or username qunique
   4.check for images ,check for cover image
   5.upload in cloudinary , avter
   6.create user object - create entry in db
   7.remove password and refresh token from user response
   8.check for user creation
   9.send response to frontend
   */

   // get user details from frontend
   const { fullName, username, email, password } = req.body;
   // console.log("User details from frontend:", {
   //    fullName,
   //    username,
   //    email,
   //    password,
   // });

   // validation of user details
   if (
      [fullName, username, email, password].some(
         (field) => field?.trim() === ""
      )
   ) {
      // console.log("Validation error: Please fill all fields");
      throw new ApiError(400, "Please fill all fields");
   }

   // check if user already exists
   const existedUser = await User.findOne({
      $or: [{ email }, { username }],
   });
   // console.log("Existed user:", existedUser);

   if (existedUser) {
      // console.log("User already exists");
      throw new ApiError(409, "User already exists");
   }

   // check for images
   const avatarLocalPath = req.files?.avatar?.[0]?.path;
   const coverLocalPath = req.files?.coverImage?.[0]?.path;
   // console.log("Avatar local path:", avatarLocalPath);
   // console.log("Cover image local path:", coverLocalPath);

   if (!avatarLocalPath) {
      // console.log("Avatar is required");
      throw new ApiError(400, "Avatar is required");
   }

   // upload in cloudinary
   const avatar = await uploadOnCloudinary(avatarLocalPath);
   const coverImage = coverLocalPath
      ? await uploadOnCloudinary(coverLocalPath)
      : null;
   // console.log("Avatar upload response:", avatar);
   // console.log("Cover image upload response:", coverImage);

   if (!avatar) {
      // console.log("Avatar is required");
      throw new ApiError(400, "Avatar is required");
   }
   if (coverLocalPath && !coverImage) {
      // console.log("Cover image upload failed");
      throw new ApiError(500, "Cover image upload failed");
   }

   // create user object
   const user = await User.create({
      fullName,
      username: username.toLowerCase(),
      email,
      password,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
   });
   // console.log("Created user:", user);

   // remove password and refresh token from user response
   const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
   );
   // console.log("Created user after selecting fields:", createdUser);

   if (!createdUser) {
      // console.log("Something went wrong while registering user");
      throw new ApiError(500, "something went wrong, while registering user");
   }

   // send response to frontend
   return res
      .status(201)
      .json(new ApiResponce(201, createdUser, "User registered successfully"));
});

export { registerUser };
