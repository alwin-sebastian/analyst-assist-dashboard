import axios from 'axios';

const ActionProvider = ({ createChatBotMessage, setState }) => {
  const handleUserMessage = async (message, clientId) => {
    try {
      const response = await axios.post('https://sj6q9j5a24.execute-api.us-east-1.amazonaws.com/prod/chat/', {
        clientId: clientId,
        query: message,
      });

      const botResponse = createChatBotMessage(response.data.response);
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, botResponse],
      }));
    } catch (error) {
      const errorMessage = createChatBotMessage(
        'Oops, something went wrong. Please try again later.'
      );
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
      }));
    }
  };

  return { handleUserMessage };
};

export default ActionProvider;
