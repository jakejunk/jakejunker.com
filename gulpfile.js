const gulp       = require("gulp");
const concatCss  = require("gulp-concat-css");
const include    = require("gulp-file-include");
const sourcemaps = require("gulp-sourcemaps");
const ts         = require("gulp-typescript");
const fs         = require("fs");
const path       = require("path");
const php        = require("gulp-connect-php");
const cleanCSS   = require("gulp-clean-css");
const uglifyes   = require("uglify-es");
const composer   = require("gulp-uglify/composer");
const uglify     = composer(uglifyes, console);
const sass       = require("gulp-sass");
const htmlmin    = require("gulp-htmlmin");
const cmdParams  = require("yargs").argv;
const merge      = require("merge-stream");
const del        = require("del");

const files = {
	html: "src/html/www/**/*.html",
	php: "src/html/www/**/*.php",
	misc: "src/html/www/**/*",
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
	gulp.parallel(CompileScss, CompileTs, ProcessHtml, CopyImages, CopyFaviconFiles, CopyMiscFiles)(done);
} 

function CompileScss()
{
	// For each folder in `src/css`, create concatenated files `<folder name>.css`
	var concatenatedCssFiles = GetFolders(files.scss).map(folder => {
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
	var concatenatedJsFiles = GetFolders(files.ts).map(folder => {
		return ProcessTsDirectory(files.ts, folder, files.outputFolder);
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
					ecma: 8,
				},
				mangle: {
					// This causes different minified files to share identifiers
					//toplevel: true,
					properties: {
						regex: /^_/
					}
				}
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
	var constructedHtml = gulp.src([files.html, files.php], {base: "src/html/www"})
		.pipe(include({
			prefix: "@@",
			suffix: "@@",
			basepath: "./src/"
		}));

	if (cmdParams.release)
	{
		constructedHtml = constructedHtml
			.pipe(htmlmin({
				collapseBooleanAttributes: true,
				collapseInlineTagWhitespace: true,
				collapseWhitespace: true,
				conservativeCollapse: true,
				decodeEntities: true,
				minifyCSS: true,
				removeAttributeQuotes: true,
				removeComments: true,
			}));
	}

	return constructedHtml.pipe(gulp.dest(files.outputFolder));
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

function CopyMiscFiles()
{
	return gulp.src([
		files.misc,
		`!${files.html}`,
		`!${files.php}`
	]).pipe(gulp.dest(files.outputFolder));
}