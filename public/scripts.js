const socket = io('http://localhost:5000')
const messageContainer = document.getElementById('message-container')
const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')
const usersOnline = document.querySelector('.users-counter')

const name = prompt('What is your name?')
appendMessage('You joined')
socket.emit('new-user', 'public', name)

socket.on('chat-message', data => {
  appendMessage(`${data.name}: ${data.message}`)
})

socket.on('user-connected', name => {
  appendMessage(`${name} connected`)
})

socket.on('user-disconnected', name => {
  appendMessage(`${name} disconnected`)
})

socket.on('online', count => {
  console.log('count :', count);
  changeUsersOnline(count)
})

function changeUsersOnline(count) {
  usersOnline.textContent = count
}

messageForm.addEventListener('submit', e => {
  e.preventDefault()
  const message = messageInput.value
  appendMessage(`You: ${message}`)
  socket.emit('send-chat-message', 'public', message)
  messageInput.value = ''
})

function appendMessage(message) {
  const messageElement = document.createElement('div')
  messageElement.innerText = message
  messageContainer.append(messageElement)
  messageContainer.scrollTop = messageContainer.scrollHeight;
}