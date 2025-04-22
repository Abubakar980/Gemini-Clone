import React, { useEffect, useRef } from 'react'
import { useState } from 'react';
import { FaMicrophone } from "react-icons/fa";
import { BsFillSendFill } from "react-icons/bs";
import './App.css';
import "regenerator-runtime/runtime";
import SpeechRecognition ,{ useSpeechRecognition } from 'react-speech-recognition';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const App = () => {

  const scrollRef = useRef(null);


  const [chats, setChats] = React.useState([]);
  // console.log(chats);
  
  const [userMessage, setUserMessage] = useState("");

  const {transcript, resetTranscript, listening} = useSpeechRecognition({});
  // console.log(transcript);
  // console.log(listening);


  useEffect(() => {
    if(!listening){
      handleSend(transcript)
    }
  },[listening])
  

  const handleFetch = async (text, id, allChats) => {
    let response = await axios.post("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyChzjh9_QQeMJmwOGUcqZvAtnKpiGQhbv0", {
      "contents": [{
        "parts": [{"text": text}],
      }]
    }) 
    resetTranscript()

    let message = response.data.candidates[0].content.parts[0].text;
    // console.log("response",response.data.candidates[0].content.parts[0].text);
    let values = allChats.map((item) => {
      return item.id === id && item.type === 'ai' ? {
        ...item,
        "message": message
      }
      :
      item
    })
    setChats(values);
    setTimeout(() => {
      scrollRef?.current.scrollIntoView({behavior: "smooth"});
    }, 500);
  }


  const handleMicrophone = () => {
    SpeechRecognition.startListening({continuous: false});
    }

  const handleSend = (msg) => {


    if(msg === "") return;



    let id = Date.now();

    let values = [
      ...chats,
      {
        id: id,
        type: "user",
        message: msg,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit', 
          minute:'2-digit',
          hour12: true
        }),
      },
      {
        id: id,
        type: "ai",
        message: "Loading...",
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit', 
          minute:'2-digit',
          hour12: true
        }),
      }
    ]
    setChats(values);
    setTimeout(() => {
      scrollRef?.current.scrollIntoView({behavior: "smooth"});
    }, 500);
    handleFetch(msg, id, values)
  }
  
  

  return (
    <div className='app'>
      <div className="chatbot-container">
        {
          chats.length === 0 ? 
          <div className="chatbot-welcome">
            <p>Welcome to iChat</p>
            <h2>Ask me anything</h2>
            </div>: 
            <div className="chatbot-messages">
              {
                chats.map((item, index) => {
                  return item.type === "user" ?
                  <UserMessage key={index} message={item.message} time={item.time} /> :
                  <AImessage key={index} message={item.message} time={item.time} />
                })
              }
            </div>
        }
        <div ref={scrollRef} style={{visibility:"hidden"}}>Hello</div>
      </div>
      <div className="chatbot-controllers">
        <div className="chatbot_logo">
          <p>iChat</p>
          <div className="blob-1"></div>
          <div className="blob-2"></div>
        </div>
        <div className="chatbot-controls-container">
          <div className="text-box">
            <textarea 
            onChange={(e => setUserMessage(e.target.value))}
            placeholder='Ask Something...!' 
            value={userMessage}></textarea>
          </div>
          <div className="chatbot-icons">
            <div className="mic-img">
            <FaMicrophone onClick={handleMicrophone}/>
            </div>
            <div className="send-img">
            <BsFillSendFill onClick={()=>{
              handleSend(userMessage)
              setUserMessage("");
              }} />
            </div>  
          </div>
        </div>
      </div>
    </div>
  )
}

export default App




function UserMessage({message, time}){
  return (
    <div className="message-user">
      <div className="message">
        <p>{message}</p>
        <span>{time}</span>
      </div>
    </div>
  )
}

function AImessage({message, time}){
  return (
    <div className="message-ai">
          <div className="message">
          <p><ReactMarkdown>{message}</ReactMarkdown></p>
          <span>{time}</span>
          </div>
        </div>
  )
}








