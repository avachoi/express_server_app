const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const morgan = require("morgan");

const usersData = require("./data/users.js");
const postsData = require("./data/posts.js");

const app = express();
const port = 8080;

app.set("views", "./views");
app.set("view engine", "pug");

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
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

/////////////////////////////ROUTS//////////////////////////////////////////////
app.get("/", (req, res) => {
	const usersList = {
		users: usersData,
	};
	res.render("users", usersList);
});
app.post("/", (req, res) => {
	if (req.body.userId && req.body.title && req.body.content) {
		const post = {
			id: postsData[postsData.length - 1].id + 1,
			userId: req.body.userId,
			title: req.body.title,
			content: req.body.content,
		};
		postsData.push(post);
		res.json(postsData[postsData.length - 1]);
	} else {
		res.json({ error: "Insufficient Data" });
	}
});

// app.get("/")

/////////////////////ERRORS////////////////////////////////////////////////////
app.get("/", (req, res) => {
	throw new Error("BROKEN"); // Express will catch this on its own.
});
app.listen(port, () => {
	console.log(`Server listening on port:${port}`);
});
