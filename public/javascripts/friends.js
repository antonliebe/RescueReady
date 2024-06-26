const BASE_IMAGE_URL = "/assets/public/images/profilePics/";
const SEARCH_IMAGE_URL = "/assets/";
const BASE_PROFILE_URL = "/friendProfile/";

let originalUserList = [];

document.addEventListener('DOMContentLoaded', function () {
    const userListElements = document.querySelectorAll('.user-list li');
    originalUserList = Array.from(userListElements).map(li => {
        return {
            id: li.querySelector('button').getAttribute('data-user-id'),
            name: li.querySelector('a').textContent,
            profilePicPath: li.querySelector('img').src.replace(location.origin, '')
        };
    });

    setupFriendshipButtonListeners();
    if (document.getElementById('newFriend')) {
        setupSearchInput();
    }
    if (document.getElementById('chat-container')) {
        setupChatButtonListeners();
        setupChatSendButton();
    }
});

function setupFriendshipButtonListeners() {
    document.querySelectorAll('.add-friend-button').forEach(button => {
        button.addEventListener('click', function () {
            const userId = this.getAttribute('data-user-id');
            const user = originalUserList.find(u => u.id === userId);
            const userName = user ? user.name : 'Der Benutzer';
            addFriend(userId, userName);
        });
    });

    document.querySelectorAll('.remove-friend-button').forEach(button => {
        button.addEventListener('click', function () {
            const friendId = this.getAttribute('data-friend-id');
            const friendName = this.getAttribute('data-friend-name');
            removeFriend(friendId, friendName);
        });
    });
}

function setupSearchInput() {
    const searchInput = document.getElementById('newFriend');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            filterUsers(this.value.trim());
        });
    } else {
        console.error('Suchfeld mit ID "newFriend" wurde nicht gefunden.');
    }
}

function setupChatButtonListeners() {
    document.querySelectorAll('.chat-button').forEach(button => {
        button.addEventListener('click', function () {
            const receiverId = this.getAttribute('data-receiver-id');
            openChat(receiverId);
        });
    });
}

function setupChatSendButton() {
    const chatSendButton = document.getElementById('chat-send');
    if (chatSendButton) {
        chatSendButton.addEventListener('click', function (event) {
            event.preventDefault();
            const messageText = document.getElementById('chat-input').value;
            const chatContainer = document.getElementById('chat-container');
            const receiverId = chatContainer.getAttribute('data-receiver-id');
            sendMessage(receiverId, messageText);
        });
    } else {
        console.error('Button mit ID "chat-send" wurde nicht gefunden.');
    }
}

function addFriend(userId, userName) {
    if(!userName) {
        userName = "Der Nutzer";
    }
    fetch(`/addFriend/${userId}`, {method: 'POST'})
        .then(response => {
            if (response.ok) {
                alert(`${userName} wurde erfolgreich hinzugefügt.`);
                location.reload();
            } else {
                alert(`${userName} existiert bereits in deiner Freundesliste.`);
            }
        })
        .catch(error => console.error('Fehler:', error));
}

function removeFriend(friendId, userName) {
    if(!userName) {
        userName = "Der Nutzer";
    }
    fetch(`/removeFriend/${friendId}`, {method: 'POST', credentials: 'include'})
        .then(response => {
            if (response.ok) {
                alert(`${userName} wurde erfolgreich entfernt.`);
                location.reload();
            } else {
                alert(`Fehler beim Entfernen von ${userName}.`);
            }
        })
        .catch(error => console.error('Fehler:', error));
}

function filterUsers(query) {

    if (!query.trim()) {
        displayUsers(originalUserList);
        return;
    }

    fetch(`/searchUsers?name=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(filteredUsers => {
            displayUsers(filteredUsers);
        })
        .catch(error => {
            console.error('Fehler beim Filtern der Nutzer:', error);
        });
}

function displayUsers(users) {
    const userListContainer = document.querySelector('.user-list');
    userListContainer.innerHTML = '';

    users.forEach(user => {
        const li = document.createElement('li');
        li.classList.add('flex', 'flex-row', 'align-items-center', 'justify-content-center', 'gap-5', 'padding-5');

        let profilePicPath;
        if (user.profilePicPath.startsWith('/assets/')) {
            profilePicPath = user.profilePicPath;
        } else {
            profilePicPath = users === originalUserList ? BASE_IMAGE_URL + user.profilePicPath : SEARCH_IMAGE_URL + user.profilePicPath;
        }

        li.innerHTML = `
            <img src="${profilePicPath}" alt="Profile Picture" style="width: 10%; max-height: 40px; max-width: 40px; border-radius: 50%;">    
            <a href="${BASE_PROFILE_URL}${user.id}" style="width: 70%; font-size: 25px;">${user.name}</a>
            <button class="add-friend-button" data-user-id="${user.id}" style="width: 20%;">Hinzufügen</button>
        `;

        li.querySelector('.add-friend-button').addEventListener('click', function () {
            addFriend(user.id, user.name);
        });

        userListContainer.appendChild(li);
    });
}

function sendMessage(receiverId, messageText) {
    if (!messageText.trim()) {
        return;
    }
    fetch(`/sendMessage/${receiverId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({content: messageText})
    })
        .then(response => {
            if (response.ok) {
                document.getElementById('chat-input').value = '';
                appendMessageToChat(messageText, 'sent');
                fetchMessages(receiverId);

            } else {
                alert('Fehler beim Senden der Nachricht.');
            }
        })
        .catch(error => {
            console.error('Fehler beim Senden der Nachricht:', error);
        });
}

function fetchMessages(receiverId) {
    const currentUserId = sessionStorage.getItem('userId');

    fetch(`/getMessages/${receiverId}`)
        .then(response => response.json())
        .then(messages => {
            const messagesContainer = document.getElementById('chat-messages');
            messagesContainer.innerHTML = '';
            messages.forEach(message => {
                const direction = message.senderId.toString() === currentUserId ? 'sent' : 'received';
                appendMessageToChat(message.messageText, direction);
            });
        })
        .catch(error => {
            console.error('Fehler beim Abrufen der Nachrichten:', error);
        });
}

function openChat(friendId) {
    fetch(`/searchUsersById?id=${friendId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Problem beim Abrufen des Nutzernamens: ${response.statusText}`);
            }
            return response.json();
        })
        .then(user => {
            if (user && user.name) {
                displayChat(user.name, friendId);
            } else {
                throw new Error('Nutzername konnte nicht gefunden werden.');
            }
        })
        .catch(error => {
            console.error('Fehler beim Abrufen der Benutzerinformationen:', error);
            alert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
        });
}

function displayChat(friendName, friendId) {
    const chatReceiverNameElement = document.getElementById('chat-receiver-name');
    const chatContainer = document.getElementById('chat-container');

    chatReceiverNameElement.textContent = `Chat mit: ${friendName}`;
    chatContainer.style.display = 'block';
    chatContainer.setAttribute('data-receiver-id', friendId);
    fetchMessages(friendId);
}


function closeChat() {
    const chatContainer = document.getElementById('chat-container');
    chatContainer.style.display = 'none';
}

function appendMessageToChat(messageText, direction) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', direction);
    messageElement.textContent = messageText;
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
