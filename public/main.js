const chatForm = document.getElementById("chat-form");

const socket = io();

//getting Username and roomID
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

// console.log(username, room);

socket.emit("joinChat", { username, room });

socket.on("message", (message) => {
  outputMessage(message);
});

//Message Submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const msg = e.target.elements.msg.value;
  socket.emit("chatMessage", msg);
});

function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${message.username}</p>
  <p class="text">
  ${message.text}
  </p>
  `;
  document.querySelector(".chat-messages").appendChild(div);
}
