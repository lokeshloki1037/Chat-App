const socket = io()
 
const $messageForm = document.querySelector('#formtext')
const $messageFormInput = document.querySelector('input')
const $messageFormButton = document.querySelector('button')
const $locationFormButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

const messagetemplate = document.querySelector('#message-template').innerHTML
const locationmessagetemplate = document.querySelector('#location-message-template').innerHTML
const sidebartemplate = document.querySelector('#sidebar-template').innerHTML

const {username,room} = Qs.parse(location.search, { ignoreQueryPrefix:true })

const autoscroll = () => {
    //new message element
    const $newMessage = $messages.lastElementChild

    //height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
//visible height
const visibleHeight = $messages.offsetHeight

//Height of messages container
const containerHeight = $messages.scrollHeight

//how for have i scrolled
const scrollOffset = $messages.scrollTop + visibleHeight

if(containerHeight - newMessageHeight <= scrollOffset){
    $messages.scrollTop = $messages.scrollHeight
}
  
}

socket.on('message',(message)=>{
    console.log(message)
    const html = Mustache.render(messagetemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm  a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationmessage',(local)=>{
    console.log(local)
    const html = Mustache.render(locationmessagetemplate,{
        username:local.username,
       url: local.url,
       createdAt:moment(local.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room,users})=>{
   const html = Mustache.render(sidebartemplate,{
       room,
       users
   })
   document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit',(e)=>{
   e.preventDefault();
   $messageFormButton.setAttribute('disabled' , 'disabled')
   const messages = e.target.elements.formtext.value

   socket.emit('sendMessage' , messages,(error)=>{
       $messageFormButton.removeAttribute('disabled')
       $messageFormInput.value=''
       $messageFormInput.focus()
  if(error){
      return console.log(error)
  }   
  console.log('message delivered')
})
})


$locationFormButton.addEventListener('click',()=>{
if(!navigator.geolocation){
    return alert('Geolocation is not supported by your browser.')
}
 $locationFormButton.setAttribute('disabled' , 'disabled')

navigator.geolocation.getCurrentPosition((position)=>{
    socket.emit('sendLocation',{
        latitude: position.coords.latitude,
        longitude:position.coords.longitude
    },()=>{
    console.log('location shared')
     $locationFormButton.removeAttribute('disabled')
})
})
})

socket.emit('join' , {username,room},(error)=>{
     if(error){
         alert(error)
         location.href='/'
     }
})