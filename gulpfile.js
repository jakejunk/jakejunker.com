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
var sass       = require("gulp-sass");


//var debugTs = ts.createProject("src/ts/tsconfig.json");
//var releaseTs = ts.createProject("src/ts/tsconfig.release.json");

// Various file locations
var files = 
{
	www: "src/html/www/**/*",
	css: "src/css/",
	ts:  "src/ts/",
	fav: "src/favicon/**/*",
	img: "src/img/**/*",
	debugOutputs: "build/debug/www",
	releaseOutputs: "build/release/www"
};


/* Tasks =================================================================== */

/**
 * Concatenates all css files in `src/css`.
 */
gulp.task("process-css", function(release)
{
	var outputFolder = release ? files.releaseOutputs : files.debugOutputs;
	var directories = getFolders(files.css);

	// For each folder in `src/css`, create concatenated files `<folder>.css`
	var concatenated = directories.map(function(folder)
	{
		console.log(folder);
		var processsedDir = cssProcessDirectory(files.css, folder, outputFolder, release);

		return processsedDir;
	});

	return concatenated;
});


/**
 * Compiles all TypeScript files.
 */
gulp.task("process-ts", function(release)
{
	var outputFolder = release ? files.releaseOutputs : files.debugOutputs;
	var directories = getFolders(files.ts);

	// For each folder in `src/ts`, create concatenated files `<folder>.js`
	var concatenated = directories.map(function(folder)
	{
		console.log(folder);
		var processsedDir = tsProcessDirectory(files.ts, folder, outputFolder, release);

		return processsedDir;
	});
	
	return concatenated;
});


/**
 * Process all HTML files and handle file includes.
 */
gulp.task("process-html", function(release)
{
	var outputFolder = release ? files.releaseOutputs : files.debugOutputs;

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
gulp.task("process-img", function(release)
{
	var outputFolder = release ? files.releaseOutputs : files.debugOutputs;

	return gulp.src(files.img)
		.pipe(gulp.dest(path.join(outputFolder, "/_include/img")));
});


/**
 * Handle all things favicon related.
 */
gulp.task("process-fav", function(release)
{
	var outputFolder = release ? files.releaseOutputs : files.debugOutputs;

	return gulp.src(files.fav)
		.pipe(gulp.dest(outputFolder));
});


gulp.task("build", ["process-css", "process-ts", "process-html", "process-img", "process-fav"], function(release)
{
	if (release)
	{
		console.log("Release");
	}
	else
	{
		console.log("Debug");
	}
});


gulp.task("serve", function(release)
{
	var outputFolder = release ? files.releaseOutputs : files.debugOutputs;
	console.log(path.join("/", outputFolder));

	gulp.src(outputFolder)
		.pipe(webserver(
		{
			host: "0.0.0.0",
			port: 8000
		}));
});


gulp.task("serve-php", function(release)
{
	var outputFolder = release ? files.releaseOutputs : files.debugOutputs;
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
	var cssFiles  = path.join(dirPath, folderName, "*.css");
	var scssFiles = path.join(dirPath, folderName, "*.scss");

	// Compile and then oncatenate all files in the specified folder
	var main = gulp.src([cssFiles, scssFiles])
			.pipe(sass().on("error", sass.logError))
			.pipe(concatCss(folderName + ".css"));

	if (release)
	{
		var cleaned = cleanCSS({
				compatibility: "ie10",
				level: 2
			}, function(details) {
				console.log(details.name + ': ' + details.stats.originalSize);
				console.log(details.name + ': ' + details.stats.minifiedSize);
			});

		// Perform CSS cleaning/minifying
		main = main.pipe(cleaned); 
	}

	return main.pipe(gulp.dest(path.join(outFolder, "/_include/css")));
}


function tsProcessDirectory(dirPath, folderName, outFolder, release)
{
	// FIXME: I'm lazy
	var debug = !release;

	var configName = debug ? "_tsconfig.json" : "_tsconfig.release.json";
	var proj = ts.createProject(path.join(dirPath, folderName, configName));
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

    return main.pipe(gulp.dest(path.join(outFolder, "/_include/js")));
}