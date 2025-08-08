sendMessage: {
    message: Message,
    conversationID: conversation
} = function () {

    const conv = find by conversationID
    conv.messages.push_back(message)
    conv.save;
}