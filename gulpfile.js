var gulp       = require("gulp-param")(require("gulp"), process.argv);
var merge      = require("merge-stream");
var concatCss  = require("gulp-concat-css");
var include    = require("gulp-file-include");
var sourcemaps = require("gulp-sourcemaps");
var ts         = require("gulp-typescript");
var fs         = require("fs");
var path       = require("path");
var webserver  = require("gulp-webserver");
var php        = require("gulp-connect-php");
var cleanCSS   = require("gulp-clean-css");
var uglify     = require("gulp-uglify");


var debugTs = ts.createProject("src/ts/tsconfig.json");
var releaseTs = ts.createProject("src/ts/tsconfig.release.json");

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
		return cssProcessDirectory(files.css.index, folder, outputFolder, release);
	});

	// Style related CSS is separate
	var everythingElse = themeDirs.map(function(folder)
	{
		return cssProcessDirectory(files.css.themes, folder, outputFolder, release);
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

	var main = proj.src();

	if (debug)
	{
		main = main.pipe(sourcemaps.init())
			.pipe(proj()).js
			.pipe(sourcemaps.write());
	}
	else
	{
		main = main.pipe(proj()).js
			.pipe(uglify({
				toplevel: true
			}));
	}

    return main.pipe(gulp.dest(path.join(outputFolder, "/_include/js")));
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
		.pipe(gulp.dest(path.join(outputFolder, "/_include/img")));
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


gulp.task("serve", function(debug, release)
{
	var outputFolder = debug ? files.debugOutputs : files.releaseOutputs;
	console.log(path.join("/", outputFolder));

	gulp.src(outputFolder)
		.pipe(webserver(
		{
			host: "0.0.0.0",
			port: 8000
		}));
});


gulp.task("serve-php", function(debug, release)
{
	var outputFolder = debug ? files.debugOutputs : files.releaseOutputs;
	console.log(path.join("/", outputFolder));

	php.server(
	{
		hostname: "0.0.0.0",
		base: outputFolder,
		ini: "/config/php.ini"
	});
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


function cssProcessDirectory(dirPath, folderName, outFolder, release)
{
	// Concatenate all files in the specified folder
	var main = gulp.src(path.join(dirPath, folderName, "*.css"))
			.pipe(concatCss(folderName + ".css"));

	if (release)
	{
		main = main.pipe(cleanCSS(
			{
				compatibility: "ie10",
				level: 2
			}, function(details)
		{
			console.log(details.name + ': ' + details.stats.originalSize);
			console.log(details.name + ': ' + details.stats.minifiedSize);
		})); 
	}

	return main.pipe(gulp.dest(path.join(outFolder, "/_include/css")));
}