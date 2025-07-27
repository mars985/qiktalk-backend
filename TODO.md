# groups and dms

<!-- ## groups

- set of users
- array of messages
- group id
- group name

## dms

- two users
- array of messages -->

## conversation

- users
- conversation id
- array of messages
- group name (nullable)
- createdAt (nullable)

## user

- user id : String
- username : String
- conversations : []

# functions

search(substr) => matchingUsernames[]

createDM(user) {
    if (find(loggedInUser + user))
    {
        // conversation already exists
        open conversation
    } else {
        user.conversations.append(loggedInUser + user) // dm id 
        loggedInUser.conversations.append(loggedInUser + user) // dm id 
    }
}

createGroup(participants[]) {
    forEach(user : participants)
    {
        user.conversations.append(randomID) // group id
    }
    loggedInUser.conversations.append(randomID) // group id
}
 