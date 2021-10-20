import React, { useContext, useState } from 'react';
import io from 'socket.io-client';
import useSound from 'use-sound';
import config from '../../../config';
import LatestMessagesContext from '../../../contexts/LatestMessages/LatestMessages';
import TypingMessage from './TypingMessage';
import Header from './Header';
import Footer from './Footer';
import Message from './Message';
import '../styles/_messages.scss';
import react from 'react';
const uuidv4 = require('uuid').v4;

const socket = io(
  config.BOT_SERVER_ENDPOINT,
  { transports: ['websocket', 'polling', 'flashsocket'] }
).emit("join", "chat");

export const disconnectSocket = () => {
  console.log('Disconnecting socket...');
  if(socket) socket.disconnect();
}

export const subscribeToChat = (cb) => {
  if (!socket) return(true);
  socket.on('chat', msg => {
    console.log('Websocket event received!');
    return cb(null, msg);
  });
}
export const sendMessage = (room, message) => {
  if (socket) socket.emit('chat', { message, room });
}

function Messages() {
  const [playSend] = useSound(config.SEND_AUDIO_URL);
  const [playReceive] = useSound(config.RECEIVE_AUDIO_URL);
  const { setLatestMessage } = useContext(LatestMessagesContext);
  const[message, setMessage] = useState("");

  const rooms = ['chat', 'B', 'C'];
  const [room, setRoom] = useState(rooms[0]);

  const [chat, setChat] = useState([]);


  react.useEffect(() => {
    subscribeToChat((err, data) => {
      if(err) return;
    });
  }, [room, chat, message]);

  const onChangeMessage = (event) => {
    const msg = {
      id: uuidv4(),
      user: "me",
      message: event.target.value,
      time: Date.now()
    }; 
    setLatestMessage("bot", msg.message)
    setMessage(msg)
    
  }

  return (
    <div className="messages">
      <Header />
      <div className="messages__list" id="message-list">
        {chat.map((message, index)=> {
          return <Message {...{message, botTyping: TypingMessage, nextMessage: index+1 < chat.length ? chat[index+1] : null }} />
        })}

      </div>
      <Footer room={room} message={message} setChat={setChat} sendMessage={sendMessage} onChangeMessage={onChangeMessage} />
    </div>
  );
}

export default Messages;
