package controllers.interfaces;

import java.util.List;

public interface FriendManager {
    boolean addFriend(int userId, int friendId);

    boolean removeFriend(int userId, int friendId);

    List<User> searchUsersByName(String searchQuery);

    List<User> getAllUsers();

    List<User> getFriends(int userId);

    List<User> getNotFriends(int userId);

    boolean isFriend(int userId, int otherUserId);
}