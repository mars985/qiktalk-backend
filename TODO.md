# Services

### user
- sign up
- log in
- search usernames

### conversation
- create dm
- create group
- add to group
- get conversations (where user is participant)

### messages
- send / create message
- get messages (with conversation id)


# Socket Events

### new message

    1. client sends a message
    2. server runs createMessage
    3. server emits getMessages
    4. client updates state messages

### new conversation

    1. client creates dm or group
    2. server runs createDM or createGroup
    3. server emits conversations
    4. client updates state conversations

# Message model

- sender: User
- body: String
- seen: {[User:Date]}