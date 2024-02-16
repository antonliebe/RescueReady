package controllers.interfaces;

import java.util.List;
/**
 * Interface for HighscoreFactory
 */
public interface AbstractHighscoreFactory {
    /**
     * Adds a highscore to the database and returns true if the highscore was added successfully, false otherwise
     * @param quizId the id of the quiz
     * @return true if the highscore was added successfully, false otherwise
     */
    List<Highscore> getHighscoresOfQuiz(int quizId);

    /**
     * Gets the highscores of a user from the database and returns them as a list
     * @param userId the id of the user
     * @return a list of highscores
     */
    List<Highscore> getHighscoresOfUser(int userId);
}
