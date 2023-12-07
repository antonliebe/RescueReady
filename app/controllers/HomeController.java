package controllers;

import play.mvc.*;
import play.twirl.api.Html;

/**
 * This controller contains an action to handle HTTP requests
 * to the application's home page.
 */
public class HomeController extends Controller {

    /**
     * An action that renders an HTML page with a welcome message.
     * The configuration in the <code>routes</code> file means that
     * this method will be called when the application receives a
     * <code>GET</code> request with a path of <code>/</code>.
     */
    public Result index() { return ok(views.html.login.render()); }
    public Result main() { return ok(views.html.main.render()); }

    public Result login() { return ok(views.html.login.render()); }

    public Result profile() { return ok(views.html.profile.render()); }
    public Result highscore() { return ok(views.html.highscore.render()); }

}
