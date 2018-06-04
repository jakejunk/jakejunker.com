<?php

session_start();

function generateFormToken()
{    
    // Generate a token from an unique value
    $token = md5(uniqid(microtime(), true));

    // Write the generated token to the session variable to check against when the form is sent
    $_SESSION["ef_token"] = $token; 
    return $token;
}

?>
<!DOCTYPE html>
<html lang="en-US">
	@@include("html/widgets/head.html", {"title": "Contact"})@@
	<body>
		@@include("html/widgets/nav-bar.html", {"current": "contact"})@@

        <div id="main-container">
            <section id="main">
                <article id="main-content">
                    <h1>Contact</h1>
                    <h2 class="center-align">Wanna chat?</h2>
                    <p>If you have the urge to give a hard-working college graduate some <span title="...or money...">encouragement</span>, then you've come to the right place! Leave a message using the form, or contact me elsewhere by following the links below.</p>
                    <div class="flex-container flex-mobile-wrap" style="margin-top: 48px;">
                        <div id="contact-pane">
                            <h3 style="margin-top: 0">Contact Info</h3>
                            <ul class="list-no-style">
                                <li><a href="mailto:contact@jakejunker.com?Subject=Hey!">contact@jakejunker.com</a></li>
                                <li><a href="https://www.linkedin.com/in/jakejunk">LinkedIn Profile</a></li>
                                <li><a href="https://github.com/jakejunk">GitHub Profile</a></li>
                            </ul>
                        </div>
                        <form action="/contact/thank-you/" method="post" id="contact-form">
                            <div class="input-row">
                                <label for="name">Name*</label>
                                <input id="name" class="text-field" name="name" type="text" placeholder="John Doe" autocomplete="off" autocorrect="off" spellcheck="false" required>
                                <span></span>
                            </div>
                            <div class="input-row">
                                <label for="address">Email*</label>
                                <input id="address" class="text-field" name="email" type="email" placeholder="your@email.com" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" required>
                                <span></span>
                            </div>
                            <div class="input-row">
                                <label for="message">Message*</label>
                                <textarea id="message" class="text-field" name="message" placeholder="What's up?!" rows="8" required></textarea>
                                <span></span>
                            </div>
                            <button id="contact-submit" type="submit" class="btn rect solid form-submit">
                                <div class="submit-progress-bar" data-progress="100"></div>
                                <span class="submit-text">SEND</span>
                            </button>
                            <input type="hidden" name="token" value="<?php echo generateFormToken(); ?>">
                        </form>
                    </div>
                </article>
            </section>
        </div>
		@@include("html/widgets/footer.html")@@
	</body>
</html>