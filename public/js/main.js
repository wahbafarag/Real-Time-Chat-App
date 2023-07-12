const form = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const roomUsers = document.getElementById("users");
const socket = io();

// get client and and room from url
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
// join room
socket.emit("joinRoom", { username, room });

// get room and users
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputRoomUsers(users);
});
socket.on("message", (message) => {
  outputMessage(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = e.target.elements.msg.value;

  // emit the msg to the server
  socket.emit("chatMessage", msg);

  // clear input field after sending a msg
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

// emit the message to DOM
function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${message.username} <span> ${message.time}</span></p>
  <p class="text"> ${message.text} </p>`;
  document.querySelector(".chat-messages").appendChild(div);
}

// room name
function outputRoomName(room) {
  roomName.innerText = room;
}
// room users
function outputRoomUsers(users) {
  roomUsers.innerHTML = "";
  users.forEach((user) => {
    const li = document.createElement("li");
    li.innerText = user.username;
    roomUsers.appendChild(li);
  });
}

// ask client for confirmation before he leaves the room
document.getElementById("leave-btn").addEventListener("click", () => {
  const leaveRoom = confirm("Are you sure you want to leave the chatroom?");
  if (leaveRoom) {
    window.location = "../index.html";
  } else {
  }
});
