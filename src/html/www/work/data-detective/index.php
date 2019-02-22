<?php

$extIP = $_SERVER['REMOTE_ADDR'];

?>

<!DOCTYPE html>
<html lang="en-US">
	@@include("html/widgets/head.html", {"specialTitle": "Data Detective" })@@
	<body>
		@@include("html/widgets/nav-bar.html", {"current": "work"})@@
        <div id="main-container">
            <section id="main">
                <link rel="stylesheet" type="text/css" href="/_include/css/data-detective.css">
                <article id="main-content">
                    <h1 class="center-align">Data Detective</h1>
                    <table class="fixed">
                        <tr><th colspan="2">System</th></tr>
                        <tr>
                            <td>Operating System</td>
                            <td class="_dd-client-calc" data-calc-type="os"></td>
                        </tr>
                        <tr>
                            <td>System RAM</td>
                            <td class="_dd-client-calc" data-calc-type="ram"></td>
                        </tr>
                        <tr>
                            <td>Logical Processors</td>
                            <td class="_dd-client-calc" data-calc-type="logicalProcessors"></td>
                        </tr>
                        <tr>
                            <td>Screen Resolution</td>
                            <td class="_dd-client-calc" data-calc-type="resolution"></td>
                        </tr>
                        <tr>
                            <td>Color Depth</td>
                            <td class="_dd-client-calc" data-calc-type="colorDepth"></td>
                        </tr>
                    </table>

                    <table class="fixed">
                        <tr><th colspan="2">Network</th></tr>
                        <tr>
                            <td>External IP Address</td>
                            <td><?php echo $extIP; ?></td>
                        </tr>
                    </table>

                    <table class="fixed">
                        <tr><th colspan="2">Miscellaneous</th></tr>
                        <tr>
                            <td>Flash Installed?</td>
                            <td class="_dd-client-calc" data-calc-type="isFlashInstalled"></td>
                        </tr>
                        <tr>
                            <td>Java Installed?</td>
                            <td class="_dd-client-calc" data-calc-type="isJavaInstalled"></td>
                        </tr>
                    </table>
                </article>
                <script class="ext-script" src="/_include/js/data-detective.js"></script>
            </section>
        </div>
		@@include("html/widgets/footer.html")@@
	</body>
</html>

