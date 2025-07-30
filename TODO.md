# groups and dms

<!-- ## groups

- set of users
- array of messages
- group id
- group name

## dms

- two users
- array of messages -->

<!-- ## conversation

- users
- conversation id
- array of messages
- group name (nullable)
- createdAt (nullable) -->

## user

- user id : String
- username : String
- conversations : []

# functions

<!-- search(substr) => matchingUsernames[] -->
searchUsers(substr, limit = 10) => [{ id, username, avatar }]

Conversation.find({ participants: userId })

<!-- createDM(user) {
    if (find(loggedInUser + user))
    {
        // conversation already exists
        open conversation
    } else {
        user.conversations.append(loggedInUser + user) // dm id 
        loggedInUser.conversations.append(loggedInUser + user) // dm id 
    }
} -->

function createDM(targetUserId) {
    const existingDM = Conversation.find({
        type: "dm",
        participants: { $all: [loggedInUserId, targetUserId], $size: 2 },
    });

    if (existingDM) return open(existingDM);
    
    const newDM = Conversation.create({
        participants: [loggedInUserId, targetUserId],
        type: "dm",
        messages: [],
    });

    return open(newDM);
}


createGroup(participants[]) {
    forEach(user : participants)
    {
        user.conversations.append(randomID) // group id
    }
    loggedInUser.conversations.append(randomID) // group id
}
 