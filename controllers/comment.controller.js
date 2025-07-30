// import Comment from "../models/comment.model.js";
// import User from "../models/register.model.js";

// export const AddComment = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { message } = req.body;
//     const user = req.user.id;

//     if (!message) {
//       res.status(400).json({ msg: "please add some message" });
//     }

//     if (!user) {
//       return res.status(400).json({ msg: "Please Login First" });
//     }

//     if (!id) {
//       return res.status(400).json({ msg: "product not found" });
//     }

//     const comment = await Comment.create({
//       userId: user,
//       productId: id,
//       message,
//     });

//     res.status(200).json({ success: true, msg: "comment successful", comment });
//   } catch (error) {
//     res.status(500).json({ msg: "error on Comment controller", error });
//     console.log(error);
//   }
// };
