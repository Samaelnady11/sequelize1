const express = require("express");
const app = express();

app.use(express.json());
const sequelize = require("./src/database/connection");
const { Op } = require("sequelize");
const User = require("./src/modules/user");
const Post = require("./src/modules/post");
const Comment = require("./src/modules/comment");

require("./src/modules/associations");

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database and tables created successfully");
  })
  .catch((error) => {
    console.error("Error:", error);
  });

  //part2 
  //POST users
  app.post("/users/signup", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await User.findOne({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already exists"
            });
        }

        const user = User.build({
            name,
            email,
            password,
            role
        });

        await user.save();

        res.status(201).json(user);

    } catch (error) {
        res.status(400).json({
            message: "Validation error",
            error: error.message
        });
    }
});

//2 PUT
app.put("/users/:id", async (req, res) => {
    try {
        const id = req.params.id;

        const user = await User.findByPk(id);

        if (user) {
            await user.update(req.body, {
                validate: false
            });

            return res.json(user);
        }

        const newUser = await User.create(
            {
                id,
                ...req.body
            },
            {
                validate: false
            }
        );

        res.status(201).json(newUser);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});
//3 GET/users/by-email
app.get("/users/by-email", async (req, res) => {
    try {
        const { email } = req.query;

        const user = await User.findOne({
            where: { email }
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json(user);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});
//4 GET /user/:id
app.get("/user/:id", async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: {
                exclude: ["role"]
            }
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json(user);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});
//B — Post APIs
app.post("/posts", async (req, res) => {
    try {
        const post = new Post(req.body);

        await post.save();

        res.status(201).json(post);

    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});
//DELETE /posts/:id
app.delete("/posts/:postId", async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.postId);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        if (post.userId != req.body.userId) {
            return res.status(403).json({
                message: "Only the owner can delete this post"
            });
        }

        await post.destroy();

        res.json({
            message: "Post deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});
//GET /posts/details
app.get("/posts/details", async (req, res) => {
    try {
        const posts = await Post.findAll({
            attributes: ["id", "title"],

            include: [
                {
                    model: User,
                    attributes: ["id", "name"]
                },
                {
                    model: Comment,
                    attributes: ["id", "content"]
                }
            ]
        });

        res.json(posts);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});
//8. GET /posts/comment-count
app.get("/posts/comment-count", async (req, res) => {
    try {
        const posts = await Post.findAll({
            attributes: [
                "id",
                "title",
                [
                    sequelize.fn(
                        "COUNT",
                        sequelize.col("Comments.id")
                    ),
                    "commentCount"
                ]
            ],

            include: [
                {
                    model: Comment,
                    attributes: []
                }
            ],

            group: ["Post.id"]
        });

        res.json(posts);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});
//C Comment APIs
 app.post("/comments", async (req, res) => {
    try {
        const comments = await Comment.bulkCreate(req.body.comments);

        res.status(201).json(comments);

    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});
//PATCH /comments/:commentId
app.patch("/comments/:commentId", async (req, res) => {
    try {
        const { userId, content } = req.body;

        const comment = await Comment.findByPk(
            req.params.commentId
        );

        if (!comment) {
            return res.status(404).json({
                message: "Comment not found"
            });
        }

        if (comment.userId != userId) {
            return res.status(403).json({
                message: "Only the owner can update this comment"
            });
        }

        comment.content = content;

        await comment.save();

        res.json(comment);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});
//11. POST /comments/find-or-create
app.post("/comments/find-or-create", async (req, res) => {
    try {
        const {
            postId,
            userId,
            content
        } = req.body;

        const [comment, created] = await Comment.findOrCreate({
            where: {
                postId,
                userId,
                content
            },

            defaults: {
                postId,
                userId,
                content
            }
        });

        res.status(created ? 201 : 200).json({
            created,
            comment
        });

    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});
//GET /comments/search?word=the
app.get("/comments/search", async (req, res) => {
    try {
        const { word } = req.query;

        const comments = await Comment.findAll({
            where: {
                content: {
                    [Op.like]: `%${word}%`
                }
            }
        });

        const count = await Comment.count({
            where: {
                content: {
                    [Op.like]: `%${word}%`
                }
            }
        });

        res.json({
            count,
            comments
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});
//GET /comments/newest/:postId
app.get("/comments/newest/:postId", async (req, res) => {
    try {
        const comments = await Comment.findAll({
            where: {
                postId: req.params.postId
            },

            order: [
                ["createdAt", "DESC"]
            ],

            limit: 3
        });

        res.json(comments);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});
//app.get("/comments/details/:id", async (req, res) => {
    app.get("/comments/details/:id", async (req, res) => {
    try {
        const comment = await Comment.findByPk(
            req.params.id,
            {
                include: [
                    {
                        model: User
                    },
                    {
                        model: Post
                    }
                ]
            }
        );

        if (!comment) {
            return res.status(404).json({
                message: "Comment not found"
            });
        }

        res.json(comment);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});
app.listen(3000, () => {
    console.log("Server running on port 3000");
});