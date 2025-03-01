// src/components/Chat.jsx
import React, { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Typography, // Added Typography import
  useMediaQuery,
  keyframes,
} from "@mui/material";
import { styled, useTheme } from "@mui/system";
import ChatIcon from "@mui/icons-material/Chat";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

// Animation keyframes
const slideIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Custom styled components
const ChatContainer = styled(Box)(({ theme }) => ({
  position: "fixed",
  bottom: 20,
  right: 20,
  width: { xs: "280px", sm: "320px", md: "360px" },
  height: { xs: "320px", sm: "400px" },
  backgroundColor: "#fff",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  border: "1px solid #eee",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  animation: `${slideIn} 0.3s ease-out`,
}));

const ChatHeader = styled(Box)(({ theme }) => ({
  backgroundColor: "#f0c14b",
  color: "#111",
  padding: theme.spacing(1, 2),
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
}));

const ChatList = styled(List)(({ theme }) => ({
  flexGrow: 1,
  overflowY: "auto",
  backgroundColor: "#f7f7f7",
  padding: theme.spacing(1),
}));

const ChatInput = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  backgroundColor: "#fff",
  borderTop: "1px solid #eee",
  display: "flex",
  gap: theme.spacing(1),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    backgroundColor: "#fff",
    "& fieldset": {
      borderColor: "#ccc",
    },
    "&:hover fieldset": {
      borderColor: "#999",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#1976d2",
    },
  },
  "& .MuiInputLabel-root": {
    color: "#555",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#1976d2",
  },
  "& input": {
    padding: "8px 12px",
  },
}));

const SendButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#1976d2",
  color: "#fff",
  borderRadius: "8px",
  "&:hover": {
    backgroundColor: "#1565c0",
    transform: "scale(1.05)",
    transition: "background-color 0.2s, transform 0.2s",
  },
}));

function Chat() {
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Mobile
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const chatListRef = useRef(null); // Ref for auto-scrolling

  useEffect(() => {
    if (user) {
      socket.emit("joinChat", user.userId);

      socket.on("chatHistory", (history) => {
        setMessages(history);
      });

      socket.on("receiveMessage", (msg) => {
        setMessages((prev) => [...prev, msg]);
      });

      return () => {
        socket.off("receiveMessage");
        socket.off("chatHistory");
      };
    }
  }, [user]);

  useEffect(() => {
    // Auto-scroll to the latest message
    if (chatListRef.current) {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (message.trim() && user) {
      socket.emit("sendMessage", {
        userId: user.userId,
        message,
        isAdmin: user.role === "admin",
      });
      setMessage("");
    }
  };

  return (
    <Box sx={{ position: "fixed", bottom: 20, right: 20 }}>
      {!open && (
        <IconButton
          onClick={() => setOpen(true)}
          sx={{
            backgroundColor: "#f0c14b",
            color: "#111",
            "&:hover": { backgroundColor: "#e0b03a" },
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <ChatIcon />
        </IconButton>
      )}
      {open && (
        <ChatContainer
          sx={{
            width: isMobile ? "280px" : "360px",
            height: isMobile ? "320px" : "400px",
          }}
        >
          <ChatHeader>
            <Typography
              variant="h6"
              sx={{ fontSize: { xs: "1rem", sm: "1.25rem" }, fontWeight: 600 }}
            >
              {t("Chat Support")}
            </Typography>
            <IconButton onClick={() => setOpen(false)} sx={{ color: "#111" }}>
              <CloseIcon />
            </IconButton>
          </ChatHeader>
          <ChatList ref={chatListRef}>
            {messages.map((msg, index) => (
              <React.Fragment key={index}>
                <ListItem
                  sx={{
                    flexDirection: "column",
                    alignItems: msg.isAdmin ? "flex-start" : "flex-end",
                    py: 1,
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: "70%",
                      bgcolor: msg.isAdmin ? "#fff" : "#e3f2fd",
                      borderRadius: "8px",
                      p: 1,
                      boxShadow: "0 1px 4px rgba(0, 0, 0, 0.05)",
                      border: msg.isAdmin ? "1px solid #ddd" : "none",
                    }}
                  >
                    <ListItemText
                      primary={msg.message}
                      primaryTypographyProps={{
                        fontSize: { xs: 12, sm: 14 },
                        color: "#111",
                      }}
                      secondary={new Date(msg.timestamp).toLocaleTimeString(
                        [],
                        { hour: "2-digit", minute: "2-digit" }
                      )}
                      secondaryTypographyProps={{
                        fontSize: { xs: 10, sm: 12 },
                        color: "#888",
                      }}
                    />
                  </Box>
                  <Typography
                    sx={{
                      fontSize: { xs: 10, sm: 12 },
                      color: "#555",
                      mt: 0.5,
                    }}
                  >
                    {msg.isAdmin ? t("Support") : t("You")}
                  </Typography>
                </ListItem>
                {index < messages.length - 1 && (
                  <Divider sx={{ bgcolor: "#eee" }} />
                )}
              </React.Fragment>
            ))}
          </ChatList>
          <ChatInput>
            <StyledTextField
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("Type a message...")}
              variant="outlined"
              size="small"
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            />
            <SendButton variant="contained" onClick={sendMessage}>
              <SendIcon fontSize="small" />
            </SendButton>
          </ChatInput>
        </ChatContainer>
      )}
    </Box>
  );
}

export default Chat;
