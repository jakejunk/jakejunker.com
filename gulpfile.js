var gulp = require("gulp");
var merge = require("merge-stream");
var concatCss = require("gulp-concat-css");
var include = require("gulp-file-include");

var srcFiles = "./src/**/*";
var srcHtmlFiles = "./src/**/*.html";
var srcCssFiles = "./src/include_/css/**/*.css";
var debugOutputs = "./build/debug/www";

/**
 * Concatenates all css files in `src` into `index.css` in build.
 */
gulp.task("process-css", function()
{
	return gulp.src(srcCssFiles)
		.pipe(concatCss("css/index.css"))
		.pipe(gulp.dest(debugOutputs + "/include_"));
});


gulp.task("process-html", function()
{
	return gulp.src(
			[
				srcHtmlFiles,
				"src/contact/index.php",
				"!src/include_/html/**/*.html",
			], {base: "src"})
		.pipe(include(
			{
				prefix: "@@",
				suffix: "@@",
				basepath: "./src/"
			}))
		.pipe(gulp.dest(debugOutputs));
});


gulp.task("build-debug", ["process-css", "process-html"], function()
{
	return gulp.src(
		[
			srcFiles,
			"!"+srcCssFiles,
			"!"+srcHtmlFiles,
			"!src/contact/index.php",
			"!src/include_/html/"
		])
		.pipe(gulp.dest(debugOutputs));
});