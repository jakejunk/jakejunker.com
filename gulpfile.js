const gulp       = require("gulp");
const concatCss  = require("gulp-concat-css");
const include    = require("gulp-file-include");
const sourcemaps = require("gulp-sourcemaps");
const ts         = require("gulp-typescript");
const fs         = require("fs");
const path       = require("path");
const php        = require("gulp-connect-php");
const cleanCSS   = require("gulp-clean-css");
const uglify     = require("gulp-uglify");
const sass       = require("gulp-sass");
const cmdParams  = require("yargs").argv;
const merge      = require("merge-stream");
const del        = require("del");

const files = {
	www: "src/html/www/**/*",
	scss: "src/scss/",
	ts:  "src/ts/",
	fav: "src/favicon/**/*",
	img: "src/img/**/*",
	debugOutputs: "build/debug/www",
	releaseOutputs: "build/release/www",
	outputFolder: "",
};


// Tasks ==========================================================================================

gulp.task("clean", gulp.series(InitEnv, CleanOutput));
gulp.task("build", gulp.series(InitEnv, BuildOutput));
gulp.task("serve", gulp.series(InitEnv, () => {
	console.log(`Serving files from: ${path.join("/", files.outputFolder)}`);

	php.server({
		base: files.outputFolder,
		ini: "/config/php.ini",
		keepalive: true,
		port: 8000,
	});
}));


// Helper functions ===============================================================================

async function InitEnv()
{
	files.outputFolder = cmdParams.release ? files.releaseOutputs : files.debugOutputs;
}


async function CleanOutput()
{
	console.log(`Cleaning ${files.outputFolder}...`);
	return del(files.outputFolder);
}


async function BuildOutput(done)
{
	if (cmdParams.clean)
	{
		await CleanOutput();
	}

	console.log(`Building ${files.outputFolder}...`);
	gulp.parallel(CompileScss, CompileTs, ProcessHtml, CopyImages, CopyFaviconFiles)(done);
} 


function CompileScss()
{
	// For each folder in `src/css`, create concatenated files `<folder name>.css`
	var concatenatedCssFiles = GetFolders(files.scss).map((folder) => {
		return ProcessScssDirectory(files.scss, folder, files.outputFolder, cmdParams.release);;
	});

	return merge(concatenatedCssFiles);
}


function ProcessScssDirectory(dirPath, folderName, outFolder)
{
	var cssFiles  = path.join(dirPath, folderName, "*.css");
	var scssFiles = path.join(dirPath, folderName, "*.scss");

	// Compile and then oncatenate all files in the specified folder
	var main = gulp.src([cssFiles, scssFiles])
			.pipe(sass().on("error", sass.logError))
			.pipe(concatCss(folderName + ".css"));

	if (cmdParams.release)
	{
		var cleaned = cleanCSS({
				compatibility: "ie10",
				level: 2
			}, (details) => {
				console.log(`${details.name}: ${details.stats.originalSize} -> ${details.stats.minifiedSize}`);
			});

		main = main.pipe(cleaned); 
	}

	return main.pipe(gulp.dest(path.join(outFolder, "/_include/css")));
}


function CompileTs()
{
	// For each folder in `src/ts`, create concatenated files `<folder name>.js`
	var concatenatedJsFiles = GetFolders(files.ts).map((folder) => {
		return ProcessTsDirectory(files.ts, folder, files.outputFolder, cmdParams.release);
	});
	
	return merge(concatenatedJsFiles);
}


function ProcessTsDirectory(dirPath, folderName, outFolder)
{
	var configName = "tsconfig.json";
	var proj = ts.createProject(path.join(dirPath, folderName, configName));
	var main = proj.src();

	if (cmdParams.release)
	{
		main = main.pipe(proj()).js
			.pipe(uglify({
				compress: {
					inline: false,
					passes: 1
				},
			}));
	}
	else
	{
		main = main.pipe(sourcemaps.init())
			.pipe(proj()).js
			.pipe(sourcemaps.write());
	}

    return main.pipe(gulp.dest(path.join(outFolder, "/_include/js")));
}


function GetFolders(dir)
{
    return fs.readdirSync(dir).filter((file) => {
		return fs.statSync(path.join(dir, file)).isDirectory();
	});
}


function ProcessHtml()
{
	return gulp.src(files.www, {base: "src/html/www"})
		.pipe(include({
			prefix: "@@",
			suffix: "@@",
			basepath: "./src/"
		}))
		.pipe(gulp.dest(files.outputFolder));
}


function CopyImages()
{
	return gulp.src(files.img)
		.pipe(gulp.dest(path.join(files.outputFolder, "/_include/img")));
}


function CopyFaviconFiles()
{
	return gulp.src(files.fav)
		.pipe(gulp.dest(files.outputFolder));
}