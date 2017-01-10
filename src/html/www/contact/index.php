<!DOCTYPE html>
<html lang="en-US">
	@@include("html/widgets/head.html", {"title": "Jake Junker - Contact"})@@
	<body>
		@@include("html/widgets/nav-bar.html", {"current": "contact"})@@

        <div id="main-container">
            <section id="main">
                <article class="color-shift" id="main-content">
                    <h1 class="main-header">Contact</h1>
                    <h2 class="section-header">Wanna chat?</h2>
                    <p>If you have the urge to give a hard-working college student some <span title="...or money...">encouragment</span>, then you've come to the right place! Leave a message using the form, or contact me elsewhere by following the links below. For the extra paranoid, I'll try to provide a GPG key soon enough.</p>
                    <div class="center-align">
                        <h2 class="red-text">NOTE: Form does not work yet!</h2>
                        <span class="whisper">(Looks good though!)</span>
                    </div>
                    <div class="flex-container flex-mobile-wrap" style="margin-top: 48px;">
                        <div id="contact-pane">
                            <h3 class="sub-section-header" style="margin-top: 0">Contact Info</h3>
                            <ul class="list-no-style">
                                <li><a href="mailto:contact@jakejunker.com?Subject=Hey!">contact@jakejunker.com</a></li>
                                <li><a href="https://www.linkedin.com/in/jakejunk">LinkedIn Profile</a></li>
                                <li><a href="https://github.com/jakejunk">GitHub Profile</a></li>
                            </ul>
                        </div>
                        <form id="contact-form">
                            <label for="name">Full Name: </label>
                            <input id="name" class="text-field" name="name" type="text" placeholder="John Doe" autocomplete="off" autocorrect="off" spellcheck="false">
                            <label for="name">Email: </label>
                            <input id="address" class="text-field" name="email" type="email" placeholder="your@email.com" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
                            <label for="message">Message: </label>
                            <textarea id="message" class="text-field" name="message" placeholder="What's up?!" rows="12"></textarea>
                            <input type="submit" class="btn rect solid" style="margin-top: 16px;" value="SEND">
                            <input type="hidden" value="<?php echo(1) ?>">
                        </form>
                    </div>
                </article>
            </section>
        </div>
		@@include("html/widgets/footer.html")@@
	</body>
</html>