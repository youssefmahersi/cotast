var envVariable = document.querySelector('[name=envVariable]').value;
console.log(envVariable)
var socket = io.connect(envVariable+":3000");

const messageContainer = document.getElementById("messages");
const statusContainer = document.getElementById("status2");
const un = document.getElementById("username2");

const input = document.getElementById("msgf");
const status = document.getElementById("status");
const roomId  = window.location.pathname.substr(6,window.location.pathname.length);
socket.on('connect', () => {
    socket.emit('join', {roomId : roomId , un : un.value }); 
  });

const sendMessage = (btn,rommId,username,status)=>{
  var message = document.querySelector('[name=message]');
  if(message.value.trim() !== ""){
    socket.emit('send message', { message: message.value , roomid : rommId , username : username ,status : status});
   message.value = "";
  }
  
}
input.addEventListener("keyup", function(event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    var message = document.querySelector('[name=message]');
    if(message.value.trim() !== ""){
      socket.emit('send message', { message: message.value , roomid : roomId , username :un.value ,status : status.value});
     message.value = "";
    }
  }
}); 

socket.on('new message', (msg) => {
  
  appendMessage(msg);
});

socket.on("user-connected",data =>{
  console.log("hehehhehe");
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
  
  messageElement.className = "p-3 mb-2 bg-light text-dark border  rounded "
  messageElement.style = "margin : 3px; padding: 3px; box-shadow: 0 2px 3px #ccc;border : 1px solid #eee; box-sizing: border-box;"
  messageElement.innerHTML = `  <p class='text-black text-left' style="font-family: 'Montserrat', sans-serif; font-size: initial;"><i class="fas fa-user-circle"></i> ${m.username} :<br> <span class='text-left bg-primary text-white rounded' style='padding: 4px;'>${mss}</span></p><p class='text-left' style="font-family: 'Montserrat', sans-serif; font-weight: bold; font-size: small;">${time}</p>`
  messageContainer.append(messageElement)
  messageContainer.scrollTop = messageContainer.scrollHeight;
}
function appendMessage2(m) {
  
  const messageElement = document.createElement('p')
  
  messageElement.className = "text-center text-danger"
  messageElement.style = "margin : 3px; padding: 3px;"
  messageElement.innerText= `${m} a connecté`
  statusContainer.append(messageElement)
  statusContainer.scrollTop = statusContainer.scrollHeight;
}
function appendMessage3(m) {
  
  const messageElement = document.createElement('p')
  
  messageElement.className = "text-center text-danger";
  messageElement.style = "margin : 3px; padding: 3px;";
  messageElement.innerText= `${m} a déconnecté`;
  statusContainer.append(messageElement);
  statusContainer.scrollTop = statusContainer.scrollHeight;
}
function linkify(text) {
  var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  return text.replace(urlRegex, function(url) {
      return '<a href="' + url + '" style="color :yellow;" target="_blank">' + url + '</a>';
  });
}
// btnSend.addEventListener('click', () => {
//   // data: { senderId: [string], receiverId: [array of receiver], msg: [string] }
//   socket.emit('send message', data);
// });

// socket.on('new message', (data) => {
//   // append to body
// });