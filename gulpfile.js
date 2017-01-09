var gulp = require("gulp-param")(require("gulp"), process.argv);
var merge = require("merge-stream");
var concatCss = require("gulp-concat-css");
var include = require("gulp-file-include");
var sourcemaps = require("gulp-sourcemaps");
var ts = require("gulp-typescript");
var fs = require("fs");
var path = require("path");


var debugTs = ts.createProject("src/ts/tsconfig.json");
var releaseTs;

// Various file locations
var files = 
{
	www: "src/html/www/**/*",
	css:
	{
		index: "src/css/",
		themes: "src/css/index/"
	},
	fav: "src/favicon/**/*",
	img: "src/img/**/*",
	debugOutputs: "build/debug/www",
	releaseOutputs: "build/release/www"
};


/* Tasks =================================================================== */

/**
 * Concatenates all css files in `src/css`.
 */
gulp.task("process-css", function(debug, release)
{
	var outputFolder = debug ? files.debugOutputs : files.releaseOutputs;
	var directories = getFolders(files.css.index);
	var themeDirs = getFolders(files.css.themes);

	// For each folder in `src/css`, create concatenated files `<folder>.css`
	var concatenated = directories.map(function(folder)
		{
			return gulp.src(path.join(files.css.index, folder, "*.css"))
				.pipe(concatCss(folder + ".css"))
				.pipe(gulp.dest(outputFolder + "/include_/css"));
		});

	// Style related CSS is separate
	var everythingElse = themeDirs.map(function(folder)
		{
			return gulp.src(path.join(files.css.themes, folder, "*.css"))
				.pipe(concatCss(folder + ".css"))
				.pipe(gulp.dest(outputFolder + "/include_/css"));
		});

	return merge(concatenated, everythingElse);
});


/**
 * Compiles all TypeScript files.
 */
gulp.task("process-ts", function(debug, release)
{
	var outputFolder = debug ? files.debugOutputs : files.releaseOutputs;
    var proj = debug ? debugTs : releaseTs;

    return proj.src()
        .pipe(sourcemaps.init())
        .pipe(proj()).js
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(outputFolder + "/include_/js"));
});


/**
 * Process all HTML files and handle file includes.
 */
gulp.task("process-html", function(debug, release)
{
	var outputFolder = debug ? files.debugOutputs : files.releaseOutputs;

	return gulp.src(files.www, {base: "src/html/www"})
		.pipe(include(
			{
				prefix: "@@",
				suffix: "@@",
				basepath: "./src/"
			}))
		.pipe(gulp.dest(outputFolder));
});


/**
 * Copy images over.
 */
gulp.task("process-img", function(debug, release)
{
	var outputFolder = debug ? files.debugOutputs : files.releaseOutputs;

	return gulp.src(files.img)
		.pipe(gulp.dest(outputFolder + "/include_/img"));
});


/**
 * Handle all things favicon related.
 */
gulp.task("process-fav", function(debug, release)
{
	var outputFolder = debug ? files.debugOutputs : files.releaseOutputs;

	return gulp.src(files.fav)
		.pipe(gulp.dest(outputFolder));
});


gulp.task("build", ["process-css", "process-ts", "process-html", "process-img", "process-fav"], function(debug, release)
{
	
});


// Helper functions ========================================================

/**
 * Returns an array of all folders in a specified directory
 */
function getFolders(dir)
{
    return fs.readdirSync(dir).filter(function(file)
		{
			return fs.statSync(path.join(dir, file)).isDirectory();
		});
}
