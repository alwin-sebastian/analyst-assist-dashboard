const MessageParser = ({ actionProvider }) => {
    const parse = (message, clientId) => {
      actionProvider.handleUserMessage(message, clientId);
    };
  
    return { parse };
  };
  
  export default MessageParser;
  