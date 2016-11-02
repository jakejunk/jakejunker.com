<!DOCTYPE html>
<html lang="en-US">
	<head>
        @@include("include_/html/head.html")@@
		<title>Contact - Jake Junker</title>
	</head>
	<body>
		<!-- Navigation menu/bar -->
		<header>
			<nav id="main-nav" class="ajax">
				<a class="ani-button" href="/">Home</a>
				<a class="ani-button" href="/projects/">Projects</a>
				<a class="ani-button" href="/about/">About</a>
				<a class="ani-button current" href="/contact/">Contact</a>
			</nav>
		</header>
        <section id="main">
            <div id="title-bar">
                <div id="title-bar-content">
                    <h1 class="main-header">Contact</h1>
                </div>
            </div>
            <article class="color-shift" id="main-content">
                <p>Want to give a hard-working college student some <span title="...or money?">encouragment</span>? How about telling him that his website is awesome? Send an email! I'm sure that he would appreciate it.</p>
                <div class="flex-container flex-mobile-wrap" style="margin-top: 48px;">
                    <div id="contact-pane">
                        <h3 class="section-header">Contact Info</h3>
                        <ul class="list-no-style">
                            <li><a href="mailto:contact@jakejunker.com?Subject=Hey!">contact@jakejunker.com</a></li>
                            <li><a href="https://www.linkedin.com/in/jakejunk">LinkedIn Profile</a></li>
                        </ul>
                    </div>
                    <form id="contact-form">
                        <label for="name">Full Name: </label>
                        <input id="name" name="name" type="text" placeholder="John Doe" autocomplete="off" autocorrect="off" spellcheck="false">
                        <label for="name">Email: </label>
                        <input id="address" name="emailaddress"  type="text" placeholder="your@email.com" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
                        <label for="message">Message: </label>
                        <textarea id="message" name="message" placeholder="What's up?!" rows="12"></textarea>
                        <div class="ani-button input-style">
                            <input type="submit" value="Send">
                        </div>
                        <input type="hidden" value="<?php echo(HI) ?>">
                    </form>
                </div>
                <div class="center-align">
                    <h2 class="red-text">NOTE: Form does not work yet!</h2>
                    <span class="whisper">(Looks good though!)</span>
                </div>
            </article>
        </section>
		@@include("include_/html/footer.html")@@
	</body>
</html>