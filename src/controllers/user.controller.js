import { asyncHandaller } from "../utils/asyncHandeller.js";

const registerUser = asyncHandaller(async (req, res) => {
   res.status(200).json({
      message: "User registered successfully!",
   });
});


export {registerUser};