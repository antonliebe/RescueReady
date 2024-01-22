package controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.google.inject.Inject;
import controllers.interfaces.ScoreboardInterface;
import models.HighscoreFactory;
import models.QuizFactory;
import play.mvc.Controller;
import play.mvc.Http;
import play.mvc.Result;
import views.html.highscore;

import java.util.List;


public class ScoreboardController extends Controller {
    private final QuizFactory quizes;
    private final ScoreboardInterface scoreboard;
    private List<HighscoreFactory.Highscore> currentHighscoreList;

    @Inject
    public ScoreboardController(QuizFactory quizes, HighscoreFactory scoreboard) {
        this.quizes = quizes;
        this.scoreboard = scoreboard;
        currentHighscoreList = scoreboard.getHighscoresOfQuiz(1);
    }

    public Result highscore(){
        return ok(highscore.render(currentHighscoreList, quizes.getPossibleQuizNames()));
    }

    public  Result renderHighscore(Http.Request request){
        JsonNode json = request.body().asJson();
        int quizId = json.findPath("quizId").asInt();
        currentHighscoreList = scoreboard.getHighscoresOfQuiz(quizId);

        return ok(highscore.render(currentHighscoreList,quizes.getPossibleQuizNames()));
    }

    public Result getHighscoreFromSession(Http.Request request) {
        String highscore = request.session().get("highscore").orElse("0");
        return ok(highscore);
    }
}
