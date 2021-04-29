const express = require('express');
const route = express.Router();
const {check, validationResult} = require('express-validator');
const Post = require('../../models/Post');
const auth = require('../../middlewares/auth')

const User = require('../../models/Users')

//@route    POST api/posts
//@desc     add post
//@access   Private
route.post('/',[auth,check('text','Text is required').notEmpty()], async(req,res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }
try {
    const user = await User.findOne({_id: req.user.id});

    const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
    })

    const post = await newPost.save();

    res.json(post);
} catch (error) {
    console.log(error.message);
    res.status(500).json({msg: 'Server Error'});
}  
})

//@route    GET api/posts/:post_id
//@desc     delete post
//@access   Private
route.get('/',auth,async (req,res) => {
    try {
        const posts=await Post.find().sort({date: -1});

        res.json(posts);
    } catch (error) {
        console.log(error.message);
    res.status(500).json({msg: 'Server Error'});
    }
})


//@route    DELETE api/posts/:post_id
//@desc     delete post
//@access   Private
route.delete('/:post_id',auth,async (req,res) => {
    try {
        const post = await Post.findOne({_id:req.params.post_id});

        if(!post) {
            return res.status(400).json({msg:'Post not found'})
        }

        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await post.remove();

        res.json({ msg: 'Post removed' });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({msg: 'Server Error'});
    }
})

//@route    PUT api/posts/like/:id
//@desc     like post
//@access   Private
route.put('/like/:id',auth,async (req,res) => {
    try {
        const post = await Post.findOne({_id: req.params.id});

        if(post.likes.some((like)=> like.user.toString()===req.user.id)) {
            return res.status(400).json({msg: 'Post already liked'});
        }

        post.likes.unshift({user: req.user.id});

        await post.save();

        return res.json(post.likes);
    } catch (error) {
        
    }
})

//@route    PUT api/posts/unlike/:id
//@desc     unlike post
//@access   Private
route.put('/unlike/:id',auth,async (req,res) => {
    try {
        const post = await Post.findOne({_id: req.params.id});

        if(post.likes.some((like)=> like.user.toString()!==req.user.id)) {
            return res.status(400).json({msg: 'Post have not been liked yet'});
        }

        post.likes=post.likes.filter(({user})=> user.toString()!==req.user.id);

        await post.save();

        return res.json(post.likes);
    } catch (error) {
        
    }
})

// @route    POST api/posts/comment/:id
// @desc     Comment on a post
// @access   Private
route.post(
    '/comment/:id',
    auth,
    check('text', 'Text is required').notEmpty(),
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
          user: req.user.id
        };
  
        post.comments.unshift(newComment);
  
        await post.save();
  
        res.json(post.comments);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
    }
  );
  
  // @route    DELETE api/posts/comment/:id/:comment_id
  // @desc     Delete comment
  // @access   Private
  route.delete('/comment/:id/:comment_id', auth, async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
  
      // Pull out comment
      const comment = post.comments.find(
        (comment) => comment.id === req.params.comment_id
      );
      // Make sure comment exists
      if (!comment) {
        return res.status(404).json({ msg: 'Comment does not exist' });
      }
      // Check user
      if (comment.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'User not authorized' });
      }
  
      post.comments = post.comments.filter(
        ({ id }) => id !== req.params.comment_id
      );
  
      await post.save();
  
      return res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Server Error');
    }
  });

module.exports = route;