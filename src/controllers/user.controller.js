import { asyncHandaller } from "../utils/asyncHandeller.js";
import { ApiError } from "./../utils/ApiError.js";
import { User } from "./../models/user.model.js";
import { uploadOnCloudinary } from "./../utils/cloudinary.js";
import { ApiResponce } from "./../utils/Apiresponce.js";

const registerUser = asyncHandaller(async (req, res) => {
   // get user details from frontend
   const { fullName, username, email, password } = req.body;
   console.log(email, password);

   // validation of user details
   if ([fullName, username, email, password].some((field) => field?.trim() === "")) {
      throw new ApiError(400, "Please fill all fields");
   }

   // check if user already exists
   const existedUser = await User.findOne({
      $or: [{ email }, { username }],
   });
   if (existedUser) {
      throw new ApiError(409, "User already exists");
   }

   // check for images
   const avatarLocalPath = req.files?.avatar?.[0]?.path;
   const coverLocalPath = req.files?.coverImage?.[0]?.path;

   console.log("req.body:", req.body);
   console.log("req.files:", req.files);

   if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar is required");
   }

   // upload in cloudinary
   const avatar = await uploadOnCloudinary(avatarLocalPath);
   const coverImage = coverLocalPath ? await uploadOnCloudinary(coverLocalPath) : null;

   if (!avatar) {
      throw new ApiError(400, "Error in uploading image");
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

   // remove password and refresh token from user response
   const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
   );

   if (!createdUser) {
      throw new ApiError(500, "something went wrong, while registering user");
   }

   // send response to frontend
   return res
      .status(201)
      .json(new ApiResponce(201, createdUser, "User registered successfully"));
});

export { registerUser };
