import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
  Avatar,
  ConversationHeader,
  ConversationHeaderContent
} from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';

const ChatBox = ({ ClientId }) => {
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    console.log("clientId", ClientId);
    const welcomeMessage = {
      content: "Hi, I'm your AI assistant, please let me know how I can help you.",
      sender: 'bot',
    };
    setMessages([welcomeMessage]);
  }, []);

  const handleSendMessage = async (message) => {
    const userMessage = { content: message, sender: 'user' };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    setTyping(true);

    try {
        console.log("clientId", ClientId);
      const response = await axios.post('https://sj6q9j5a24.execute-api.us-east-1.amazonaws.com/prod/chat/', {
        clientId: ClientId,
        query: message,
      });
    //   const response = { data: { response: 'I am a bot. I am here to help you.' } };
      const botResponse = { content: response.data.response, sender: 'bot' };

      setMessages((prevMessages) => [...prevMessages, botResponse]);
    } catch (error) {
      const errorMessage = { content: 'Oops, something went wrong. Please try again later.', sender: 'bot' };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <MainContainer responsive 
    // style={{ height: 'auto' }}
    className="max-h-screen"
    >
      <ChatContainer>
        <ConversationHeader>
          <Avatar src="https://getstream.imgix.net/images/random_svg/AI.png" name="Bot" />
          <div style={{ 
            marginLeft: '10px', 
            fontWeight: 'bold', 
            fontSize: '18px', 
            display: 'flex', 
            alignItems: 'center'
          }}>Chat</div>
        </ConversationHeader>
        <MessageList typingIndicator={typing && <TypingIndicator content="Bot is typing..." />}>
          {messages.map((msg, index) => (
            <Message
              key={index}
              model={{
                message: msg.content,
                sentTime: 'just now',
                sender: msg.sender,
                direction: msg.sender === 'user' ? 'outgoing' : 'incoming',
                position: 'single',
              }}
            >
              {msg.sender === 'bot' && <Avatar src="https://getstream.imgix.net/images/random_svg/AI.png" name="Bot" />}
              {msg.sender === 'user' && <Avatar src="https://getstream.imgix.net/images/random_svg/ME.png" name="User" />}
            </Message>
          ))}
        </MessageList>
        <MessageInput placeholder="Type your message..." onSend={handleSendMessage} />
      </ChatContainer>
    </MainContainer>
  );
};

export default ChatBox;
