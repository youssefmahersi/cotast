var envVariable = document.querySelector('[name=envVariable]').value;
console.log(envVariable)
var socket = io.connect(envVariable+":5018");

const messageContainer = document.getElementById("messages");
const statusContainer = document.getElementById("status");
const un = document.getElementById("username2");

const roomId  = window.location.pathname.substr(6,window.location.pathname.length);
socket.on('connect', () => {
    socket.emit('join', {roomId : roomId , un : un.value }); 
  });

const sendMessage = (btn,rommId,username)=>{
  var message = document.querySelector('[name=message]');
  if(message.value !== ""){
    socket.emit('send message', { message: message.value , roomid : rommId , username : username});
   message.value = "";
  }
  
}
socket.on('new message', (msg) => {
  appendMessage(msg);
});

socket.on("user-connected",data =>{
  appendMessage2(data);
  
})
socket.on("user-disconnected",data =>{
  appendMessage3(data);
  
})
// socket.on("resend-msg",(msg)=>{
//   console.log(msg);
//   appendMessage(msg.msg);
// })
function appendMessage(m) {
  const time = renderDate(Number(`${m.messagetime}`))
  const messageElement = document.createElement('div')
  var mss = linkify(m.message);
  
  messageElement.className = "p-3 mb-2 bg-light text-dark border border-secondary rounded"
  messageElement.style = "margin : 3px; padding: 3px;"
  messageElement.innerHTML = `  <p class='text-black text-left'><i class='far fa-user'></i> ${m.username} : <span class='text-left bg-primary text-white rounded' style='padding: 4px;'>${mss}</span></p><p class='text-left'>${time}</p>`
  messageContainer.append(messageElement)
  messageContainer.scrollTop = messageContainer.scrollHeight;
}
function appendMessage2(m) {
  
  const messageElement = document.createElement('p')
  
  messageElement.className = "text-center text-danger"
  messageElement.style = "margin : 3px; padding: 3px;"
  messageElement.innerText= `${m} a connecté`
  statusContainer.append(messageElement)
  statusContainer.scrollTop = messageContainer.scrollHeight;
}
function appendMessage3(m) {
  
  const messageElement = document.createElement('p')
  
  messageElement.className = "text-center text-danger"
  messageElement.style = "margin : 3px; padding: 3px;"
  messageElement.innerText= `${m} a déconnecté`
  statusContainer.append(messageElement)
  statusContainer.scrollTop = messageContainer.scrollHeight;
}
function linkify(text) {
  var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  return text.replace(urlRegex, function(url) {
      return '<a href="' + url + '" style="color :red;">' + url + '</a>';
  });
}
// btnSend.addEventListener('click', () => {
//   // data: { senderId: [string], receiverId: [array of receiver], msg: [string] }
//   socket.emit('send message', data);
// });

// socket.on('new message', (data) => {
//   // append to body
// });