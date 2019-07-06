<?php

$dir = new DirectoryIterator('./');

?>
<!DOCTYPE html>
<html lang="en-US">
	@@include("html/widgets/head.html", {"title": "Work"})@@
	<body>
		@@include("html/widgets/nav-bar.html", {"current": "work"})@@
        <div id="main-container">
            <section id="main">
                <article id="main-content">
                    <h1>Work</h1>

                    <h2 class="center-align">It's a portfolio, I guess</h2>
                    <p>I'll try to keep this page updated with personal projects of mine that I find worth sharing. I'm always looking for improvement, so feel free to share any criticism or praise over on the <a href="/contact/" data-ajax-target="#main">contact</a> page. Thanks for stopping by!</p>

                    <nav class="project-blks">
                        <ul class="list-no-style">
                            <?php
                            foreach ($dir as $fileinfo)
                            {
                                if ($fileinfo->isDir() && !$fileinfo->isDot())
                                {
                                    $dirname = $fileinfo->getFilename();
                                    $filename = $dirname.'/proj.json';

                                    if (file_exists($filename) && filesize($filename) > 0)
                                    {
                                        $proj = json_decode(file_get_contents($filename));
                                        if ($proj !== NULL)
                                        {
                                            $projTitle = $proj->{'title'};
                                            $projElementStyle = 'style="background-image: url(' . $proj->{'image'} . '), url(/_include/img/logo_v2_gradient.svg)"';

                                            // This assumes a file called "/_include/img/logo_v2_gradient.svg" exists
                                            echo '<li class="proj-block"><a class="proj-link"' . $projElementStyle . 'data-projTitle="' . $projTitle . '" href="' . $dirname . '/"></a>' .
                                            '<div class="proj-desc"><h3>' . $projTitle . '</h3><p>' . $proj->{'description'} . '</p></div></li>';
                                        }
                                    }
                                }
                            }
                            ?>
                            </ul>
                    </nav>
                </article>
            </section>
        </div>
		@@include("html/widgets/footer.html")@@
	</body>
</html>