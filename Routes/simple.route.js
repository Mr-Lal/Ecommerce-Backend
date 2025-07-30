import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import User from "../models/register.model.js";
// import { AddComment } from "../controllers/comment.controller.js";
import Comment from "../models/comment.model.js";
import io from "../server.js";
import notificationModel from "../models/notification.model.js";

const simpleRoutes = express.Router();

simpleRoutes.get("/token-data", verifyToken, async (req, res) => {
  try {
    const user = req.user;
    const id = user.id;

    const userFind = await User.findById(id).select("username email createdAt");

    res.status(200).json({
      msg: "user find successful",
      username: userFind.username,
      email: userFind.email,
      Since: userFind.createdAt,
    });
  } catch (error) {
    res.send(error);
  }
});

simpleRoutes.post("/comment/:id", verifyToken, async (req, res) => {
  try {
    const { message } = req.body;
    const postId = req.params.id;
    const user = req.user.id;

    if (!message)
      return res.status(400).json({ error: "Comment message is required" });
    const count = await Comment.countDocuments({ user, postId });

    if (count >= 3) {
      return res
        .status(403)
        .json({ error: "You can only comment 3 times per product." });
    }

    const newComment = new Comment({
      message,
      productId: postId,
      userId: user,
    });
    await newComment.save();

    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

simpleRoutes.get("/comment/:id", verifyToken, async (req, res) => {
  try {
    const comments = await Comment.find({ productId: req.params.id }).populate(
      "userId",
      "username"
    );

    res.json({ comments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

simpleRoutes.post("/comment/:commentId/like", verifyToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).send({ error: "Comment not found" });

    const userId = req.user.id;

    const alreadyLiked = comment.likedBy.some((id) => id.toString() === userId);
    const alreadyDisliked = comment.dislikedBy.some(
      (id) => id.toString() === userId
    );

    if (alreadyLiked) {
      comment.likedBy = comment.likedBy.filter(
        (id) => id.toString() !== userId
      );
    } else {
      comment.likedBy.push(userId);
      if (alreadyDisliked) {
        comment.dislikedBy = comment.dislikedBy.filter(
          (id) => id.toString() !== userId
        );
      }
    }

    // Update likes/dislikes count
    comment.likes = comment.likedBy.length;
    comment.dislikes = comment.dislikedBy.length;

    await comment.save();
    res.send(comment);
  } catch (error) {
    console.error(error);
    res.status(400).send({ error: error.message });
  }
});

simpleRoutes.post(
  "/comment/:commentId/dislike",
  verifyToken,
  async (req, res) => {
    try {
      const comment = await Comment.findById(req.params.commentId);
      if (!comment) {
        return res.status(404).send({ error: "Comment not found" });
      }

      const userId = req.user.id;

      const alreadyDisliked = comment.dislikedBy.some(
        (id) => id.toString() === userId
      );
      const alreadyLiked = comment.likedBy.some(
        (id) => id.toString() === userId
      );

      if (alreadyDisliked) {
        // Remove dislike
        comment.dislikedBy = comment.dislikedBy.filter(
          (id) => id.toString() !== userId
        );
      } else {
        // Add to dislikedBy
        comment.dislikedBy.push(userId);

        // If already liked, remove from likedBy
        if (alreadyLiked) {
          comment.likedBy = comment.likedBy.filter(
            (id) => id.toString() !== userId
          );
        }
      }

      // Update counts
      comment.likes = comment.likedBy.length;
      comment.dislikes = comment.dislikedBy.length;

      await comment.save();
      res.send(comment);
    } catch (error) {
      console.log(error);
      res.status(400).send({ error: error.message });
    }
  }
);

simpleRoutes.post("/comment/:id", verifyToken, async (req, res) => {
  try {
    const { message } = req.body;
    const postId = req.params.id;
    const user = req.user.id;

    if (!message)
      return res.status(400).json({ error: "Comment message is required" });

    const count = await Comment.countDocuments({ user, postId });

    if (count >= 3) {
      return res
        .status(403)
        .json({ error: "You can only comment 3 times per product." });
    }

    const newComment = new Comment({
      message,
      productId: postId,
      userId: user,
    });

    await newComment.save();
    const populatedComment = await newComment.populate("userId", "username");

    const io = req.app.get("io");
    // 🔥 Emit the comment to all users
    console.log("Emitting to all clients:", populatedComment);
    io.emit("receiveComment", populatedComment);

    res.status(201).json(populatedComment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

simpleRoutes.get("/get-notification", async (req, res) => {
  try {
    const notifications = await notificationModel.find();

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: "Error fetching notifications" });
  }
});
simpleRoutes.put("/:id/seen", async (req, res) => {
  try {
    await notificationModel.findByIdAndUpdate(req.params.id, { isSeen: true });
    res.status(200).json({ message: "Notification marked as seen" });
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
    console.log(err);
  }
});

export default simpleRoutes;
