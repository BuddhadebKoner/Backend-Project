import { asyncHandaller } from "../utils/asyncHandeller.js";
import { ApiError } from "./../utils/ApiError.js";
import { User } from "./../models/user.model.js";
import { uploadOnCloudinary } from "./../utils/cloudinary.js";
import { ApiResponce } from "./../utils/Apiresponce.js";

const registerUser = asyncHandaller(async (req, res) => {
   // get user details from frontend
   // validation of user details , not empty, email format
   // check if user already exists , email or username qunique
   // check for images ,check for cover image
   // upload in cloudinary , avter
   // create user object - create entry in db
   // remove password and refresh token from user response
   // check for user creation
   // send response to frontend

   // get user details from frontend
   const { fullname, username, email, password } = req.body;
   console.log(email, password);

   // validation of user details
   if (
      [fullname, username, email, password].some(() => {
         feild?.trim() === "";
      })
   ) {
      throw new ApiError(400, "Please fill all fields");
   }

   // check if user already exists
   const existedUser = User.findOne({
      $or: [{ email }, { username }],
   });
   if (existedUser) {
      throw new ApiError(409, "User already exists");
   }

   // check for images
   const avtarLocalPath = req.files?.avatar[0]?.path;
   const coverLocalPath = req.files?.coverImage[0]?.path;
   if (!avtarLocalPath) {
      throw new ApiError(400, "Avatar is required");
   }

   // upload in cloudinary
   const avatar = await uploadOnCloudinary(avtarLocalPath);
   const coverImage = await uploadOnCloudinary(coverLocalPath);

   if (!avatar) {
      throw new ApiError(400, "Error in uploading image");
   }

   // create user object
   const user = await User.create({
      fullname,
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
      throw new ApiError(500, "something went wrong, while regtstring user");
   }

   // send response to frontend
   return res
      .status(201)
      .json(new ApiResponce(201, createdUser, "User registered successfully"));
});

export { registerUser };
