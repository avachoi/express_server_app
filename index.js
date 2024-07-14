const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const morgan = require("morgan");
const methodOverride = require("method-override");

const usersData = require("./data/users.js");
const postsData = require("./data/posts.js");

const app = express();
const port = 8080;

app.set("views", "./views");
app.set("view engine", "pug");

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use((req, res, next) => {
	const time = new Date();

	console.log(
		`-----
${time.toLocaleTimeString()}: Received a ${req.method} request to ${req.url}.`
	);
	if (Object.keys(req.body).length > 0) {
		console.log("Containing the data:");
		console.log(`${JSON.stringify(req.body)}`);
	}
	next();
});
//using morgan
app.use(
	morgan(function (tokens, req, res) {
		return [
			tokens.method(req, res),
			tokens.url(req, res),
			tokens.status(req, res),
			tokens.res(req, res, "content-length"),
			"-",
			tokens["response-time"](req, res),
			"ms",
		].join(" ");
	})
);
app.use((req, res, next) => {
	console.log(`Serving: ${req.url}`);
	next();
});

/////////////////////////////ROUTS//////////////////////////////////////////////
app.get("/", (req, res) => {
	res.set("Cache-Control", "public, max-age=3600");
	res.set();
	const usersList = {
		users: usersData,
	};
	res.render("users", usersList);
});
app.post("/", (req, res) => {
	if (req.body.username && req.body.email) {
		const newUser = {
			id: usersData.length > 0 ? usersData[usersData.length - 1].id + 1 : 1,
			username: req.body.username,
			email: req.body.email,
		};
		usersData.push(newUser);
		console.log("new user in the list", usersData[usersData.length - 1]);
		res.redirect("/");
	} else {
		res.json({ error: "Insufficient Data for new user" });
	}
});

app.get("/:id", (req, res) => {
	let user = usersData.find((user) => user.id == parseInt(req.params.id));

	if (user) {
		let posts = postsData.filter((post) => post.userId == req.params.id);
		if (req.query.filterTitle) {
			posts = posts.filter((post) =>
				post.title.toLowerCase().includes(req.query.filterTitle.toLowerCase())
			);
		}
		const usersPosts = {
			user: user,
			posts: posts,
		};

		if (usersPosts) {
			res.render("posts", usersPosts);
		}
	} else {
		res.status(404).send("user not found");
	}
});
app.post("/:id", (req, res) => {
	if (req.body.title && req.body.content) {
		let user = usersData.find((user) => user.id === req.params.id);

		const usersPosts = {
			user: user,
			posts: postsData.filter((post) => post.userId == req.params.id),
		};
		const post = {
			id: postsData[postsData.length - 1].id + 1,
			userId: req.params.id,
			title: req.body.title,
			content: req.body.content,
		};
		postsData.push(post);
		console.log("postsData", postsData);
		res.redirect(`/${req.params.id}`);
	} else {
		res.json({ error: "Insufficient Data" });
	}
});

app.get("/:id/:postId", (req, res) => {
	const post = postsData.find((p) => p.id == req.params.postId);
	if (post) {
		res.render("post", { userId: post.userId, post: post });
	} else {
		res.json({ error: "Post not found" });
	}
});
app.put("/:id/:postId", (req, res) => {
	const postIndex = postsData.findIndex((p) => p.id == req.params.postId);
	if (postIndex !== -1 && req.body.title && req.body.content) {
		postsData[postIndex].title = req.body.title;
		postsData[postIndex].content = req.body.content;
		console.log("editied", postsData[postIndex]);
		res.redirect(`/${req.params.id}`);
	} else {
		res.json({ error: "post not found or insufficient data" });
	}
});
app.delete("/:id/:postId", (req, res) => {
	const postIndex = postsData.findIndex((p) => p.id == req.params.postId);
	if (postIndex) {
		postsData.splice(postIndex, 1);
		res.redirect(`/${req.params.id}`);
	} else {
		res.json({ error: "post to be deleted not found" });
	}
});

/////////////////////ERRORS////////////////////////////////////////////////////
app.get("/", (req, res) => {
	throw new Error("BROKEN"); // Express will catch this on its own.
});
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ error: "Something went wrong!" });
});
app.listen(port, () => {
	console.log(`Server listening on port:${port}`);
});
