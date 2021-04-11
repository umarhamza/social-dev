const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const ObjectId = require('mongoose').Types.ObjectId;
const auth = require('../../middleware/auth');

const Post = require('../../models/Post');
const User = require('../../models/User');
const Profile = require('../../models/Profile');

// @route POST api/posts
// @desc Create a post
// @access Private
router.post(
  '/',
  [auth, [check('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');

      const newPost = new Post({
        title: req.body.title,
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });

      const post = await newPost.save();
      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route GET api/posts
// @desc Get all posts
// @access Private
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route GET api/posts/post_id
// @desc Get a single posts
// @access Private
router.get('/:id', auth, async (req, res) => {
  const id = ObjectId.isValid(req.params.id) ? req.params.id : null;
  const notFound = () => res.status(404).json({ msg: 'Post not found!' });

    console.log(id);


  try {
    const post = await (id ? Post.findById(req.params.id) : null);
    if (!post) return notFound();
    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return notFound();
    res.status(500).send('Server Error');
  }
});

// @route DELETE api/posts/:id
// @desc Delete a posts
// @access Private
router.delete('/:id', auth, async (req, res) => {
  const id = ObjectId.isValid(req.params.id) ? req.params.id : null;

  try {
    const post = await (id ? Post.findById(id) : null);

    // Check post
    if (!post) {
      return res.status(404).json({ msg: 'Post not found!' });
    }

    // Check user
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorised' });
    }

    await post.remove();

    res.json({ msg: 'Post removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route PUT api/post/:id
// @desc Update a post
// @access Private
router.put(
  '/:id',
  auth,
  [check('text', 'Text is required').not().isEmpty()],
  async (req, res) => {
    const id = ObjectId.isValid(req.params.id) ? req.params.id : null;

    try {
      // Get post
      const post = await (id ? Post.findById(id) : null);
      if (!post) return res.status(404).json({ msg: 'Post not found!' });

      // If user is not authorised
      if (post.user.toString() !== req.user.id)
        return res.status(401).json({ msg: 'User not authorised' });

      const newPost = await Post.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      res.json(newPost);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route PUT api/posts/like/:id
// @desc Like a post
// @access Private
router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await (ObjectId.isValid(req.params.id)
      ? Post.findById(req.params.id)
      : null);
    if (!post) return res.status(404).json({ msg: 'Post not found!' });

    // Check if post has already been liked by user
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(404).json({ msg: 'Post already liked!' });
    }

    // Add the current users Id to the post's likes array
    post.likes.unshift({ user: req.user.id });

    // Save post
    await post.save();

    // Return likes
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route PUT api/posts/unlike/:id
// @desc Unlike a post
// @access Private
router.put('/unlike/:id', auth, async (req, res) => {
  try {
    const post = await (ObjectId.isValid(req.params.id)
      ? Post.findById(req.params.id)
      : null);
    if (!post) return res.status(404).json({ msg: 'Post not found!' });

    // Check if post has already been liked by user
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(404).json({ msg: 'Post has not yet been liked!' });
    }

    // Remove a like from likes array
    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);
    post.likes.splice(removeIndex, 1);

    // Save post
    await post.save();

    // Return likes
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route POST api/posts/comment/:id
// @desc Comment on a post
// @access Private
router.post(
  '/comment/:id',
  [auth, [check('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');
      const post = await Post.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };

      // Add new comment to post - comments array
      post.comments.unshift(newComment);

      // Save posts
      await post.save();

      // Return comments
      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route DELETE api/posts/comment/:id/:comment_id
// @desc Delete comment
// @access Private

router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
  const id = ObjectId.isValid(req.params.id) ? req.params.id : null;
  const comment_id = ObjectId.isValid(req.params.comment_id)
    ? req.params.comment_id
    : null;

  try {
    // Get the post and check if post exists
    const post = await (id ? Post.findById(id) : null);
    if (!post) return res.status(404).json({ msg: 'Post not found!' });

    // Get comment and check if it exists
    const comment = post.comments.find((comment) => comment.id === comment_id);
    if (!comment)
      return res.status(404).json({ msg: 'Comment does not exist!' });

    // Check if user is commentor
    if (comment.user.toString() !== req.user.id)
      return res.status(401).json({ msg: 'User not authorised' });

    removeIndex = post.comments
      .map((comment) => comment.id)
      .indexOf(comment_id);

    post.comments.splice(removeIndex, 1);

    await post.save();

    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route PUT api/posts/comment/:id/:comment_id
// @desc Update comment
// @access Private

router.put(
  '/comment/:id/:comment_id',
  [auth, [check('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    const id = ObjectId.isValid(req.params.id) ? req.params.id : null;
    const comment_id = ObjectId.isValid(req.params.comment_id)
      ? req.params.comment_id
      : null;

    try {
      // Get post
      const post = await (id ? Post.findById(id) : null);
      if (!post) return res.status(404).json({ msg: 'Post not found!' });

      // Get comment and check if it exist
      const comment = post.comments.find(
        (comment) => comment.id === comment_id
      );
      if (!comment)
        return res.status(404).json({ msg: 'Comment does not exist!' });

      // If user is not authorised
      if (comment.user.toString() !== req.user.id)
        return res.status(401).json({ msg: 'User not authorised' });

      // Get user details without password
      const user = await User.findById(req.user.id).select('-password');

      // Find index of comment
      const removeIndex = post.comments
        .map((comment) => comment.id)
        .indexOf(comment_id);

      const newComment = {
        _id: comment_id,
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };

      post.comments.splice(removeIndex, 1, newComment);

      await post.save();

      res.json(post.comments);
    } catch (err) {
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
