var gulp = require("gulp");
var merge = require("merge-stream");
var concatCss = require("gulp-concat-css");
var include = require("gulp-file-include");

/* Various file locations */
var allFiles = "./src/**/*";
var allHtml = "./src/**/*.html";
var allCss = "./src/include_/css/**/*.css";
var highlight = "./src/include_/css/highlight.css";
var highlightDark = "./src/include_/css/highlight-dark.css";
var allJS = "./src/include_/js/**/*.js";
var debugOutputs = "./build/debug/www";
var releaseOutputs = "./build/release/www";

/**
 * HTML files that need to be processed.
 * Also includes our one PHP page, and ignores "fragment" files.
 */
var processedHtmlFiles = 
[
	allHtml,
	"src/contact/index.php",
	"!src/include_/html/**/*.html"
];


/**
 * CSS files that need to be concatenated.
 * It's basically all of them except the highlight files.
 */
var concatCssFiles =
[
	allCss,
	"!"+highlight,
	"!"+highlightDark
];


/* Tasks =================================================================== */

/**
 * Concatenates all css files in `src` into `index.css` in build.
 */
gulp.task("process-css-debug", function()
{
	var concatenated = gulp.src(concatCssFiles)
		.pipe(concatCss("css/index.css"))
		.pipe(gulp.dest(debugOutputs + "/include_"));

	var everythingElse = gulp.src(
			[
				highlight,
				highlightDark
			])
		.pipe(gulp.dest(debugOutputs + "/include_/css"));

	return merge(concatenated, everythingElse);
});


gulp.task("process-html-debug", function()
{
	return gulp.src(processedHtmlFiles, {base: "src"})
		.pipe(include(
			{
				prefix: "@@",
				suffix: "@@",
				basepath: "./src/"
			}))
		.pipe(gulp.dest(debugOutputs));
});


gulp.task("build-debug", ["process-css-debug", "process-html-debug"], function()
{
	return gulp.src(
		[
			allFiles,
			"!"+allCss,
			"!"+allHtml,
			"!src/contact/index.php",
			"!src/include_/html/"
		])
		.pipe(gulp.dest(debugOutputs));
});