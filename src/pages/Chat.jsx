import { Box, TextField } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import SendIcon from "@mui/icons-material/Send";

import { chats } from "../utils/constants";
import SingleChatBox from "../components/SingleChatbox";
import { sendRequest } from "../utils/Request";

const Chat = () => {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const handleChangeText = (e) => {
    const value = e.target.value;
    if (value.length <= 512) {
      setText(e.target.value);
    }
  };

  const endOfMessagesRef = useRef(null); // Ref to track the last message

  // Function to scroll to the last message
  const scrollToBottom = () => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Effect to scroll to the bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);



  const sendMessage = (msg) => {
    const formdata = new FormData();
    formdata.append("msg", msg);
    let answer = "";
    setMessages([...messages, { content: msg, role: "user" }]);
    
    

    sendRequest("user-question", {
      body: formdata
    })
      .then(response => {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        function read() {
          return reader.read().then(({ done, value }) => {
            if (done) {
              console.log('Streaming completed.');
              setMessages([
                ...messages,
                {content:msg, role:"user"},
                {content:answer, role:"assistant"}
              ]);
              return;
            }
            const data = decoder.decode(value);
            answer += data;
            setMessages([
              ...messages,
              {content:msg, role:"user"},
              {content:answer, role:"assistant"}
            ])
            // chat_ref.current.scrollTop = chat_ref.current.scrollHeight;
            return read();
          });
        }
        return read();
      })
      .catch(error => {
        console.error('Error fetching streaming data:', error);
      });
  };

  const handleClickSendButton = (e) => {
    console.log(text);
    sendMessage(text);
    setText("");
  };

  const handleInput = useCallback(
    (ev) => {
      if (ev.key === "Enter" && !ev.shiftKey) {
        sendMessage(ev.target.value);
        setText("");
      }
    },
    [sendMessage]
  );

  useEffect(() => {
    sendRequest("create-new-thread").then((response) => response.json());
  }, []);

  // useEffect(() => {
  //   chat_ref.current.scrollTop = 1000;
  //     if (chat_ref.current) {
  //       chat_ref.current.scrollTop = chat_ref.current.scrollHeight;
  //     }
  // }, [messages]);

  return (
    <>
      <Box
        // maxHeight="90vh"
        sx={{
          overflowY: "auto",
          "&::-webkit-scrollbar": {
            width: "18px",
            background: "#2949AB40",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgb(41, 73, 171)",
          },
        }}
        
      >
        <Box
          px={[1, 1, 2]}
          display="flex"
          flexDirection="column"
          gap={2}
          bgcolor="rgb(21, 28, 44)"
          pt={4}
          pb={14}
          minHeight="80vh"
        >
          {/* {messages.map((item, index) => {
            const isLastMessage = index === messages.length - 1;
            return <SingleChatBox
              key={item.id}
              {...item} 
              ref={isLastMessage ? messagesEndRef : null}
            />;
          })} */}
          {messages.map((item, index) => {
            // Check if this message is the last one in the array
            const isLastMessage = index === messages.length - 1;
            return (
              <div key={item.id} ref={isLastMessage ? endOfMessagesRef : null}>
                <SingleChatBox {...item} />
              </div>
            );
          })}
        </Box>
      </Box>

      <Box
        bgcolor="#190821"
        display="flex"
        py={2}
        alignItems="center"
        justifyContent="space-between"
        gap={1}
        sx={{
          position: "fixed",
          bottom: 0,
          width: "100%",
        }}
      >
        <Box ml={2} width="100%">
          <TextField
            size="small"
            sx={{
              background: "#7E839C40",
              border: "none",
              borderRadius: "25px",
              width: "100%",
              "& fieldset": { border: "none" },
              input: { color: "#FFF", fontWeight: 600 },
            }}
            value={text}
            onChange={handleChangeText}
            onKeyUp={handleInput}
          />
        </Box>
        <Box display="flex" justifyContent="flex-end" mx={3}>
          <Box sx={{ cursor: "pointer" }} onClick={handleClickSendButton}>
            <SendIcon sx={{ color: "white", fontSize: "35px" }} />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Chat;
