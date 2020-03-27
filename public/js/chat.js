

const socket = io()

//elements
const $messageForm = document.querySelector("#message-form")
const $messageFormInput = document.querySelector('input')
const $messageFormButton = document.querySelector('#send-button')
const $locationButton = document.querySelector('#location-button')
const $messages = document.querySelector('#messages')
const $location = document.querySelector('#location')


//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const {username , room} = Qs.parse(location.search ,{ignoreQueryPrefix: true})


const autoScroll = () => {
    //new message element
    const $newMessage = $messages.lastElementChild

    //height
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    const visibleHeight = $messages.offsetHeight

    const containerHeight = $messages.scrollHeight

    const scrolloffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= Math.round (scrolloffset)) {
        $messages.scrollTop = $messages.scrollHeight
    }
    console.log($newMessage.offsetHeight)
    console.log(scrolloffset)
}


socket.on('roomData' , ({room , users}) => {

    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})


socket.on('locmes' , (loc) => {
    console.log(loc)
    const html = Mustache.render(locationTemplate , {
        username : loc.username,
        url:loc.url,
        createdAt:moment(loc.createdAt).format('h:mm a')
    })

    $messages.insertAdjacentHTML('beforeend' , html)
    autoScroll()
})

socket.on('message' , (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate , {
        username : message.username,
        message : message.text,
        createdAt : moment(message.createdAt).format('h:mm a' ) //message.createdAt
    })
    $messages.insertAdjacentHTML('beforeend' , html)
    autoScroll()
})

$messageForm.addEventListener('submit' , (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')

    //disable

    const res_message = e.target.elements.message.value

    socket.emit('response' , res_message , (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ""
        $messageFormInput.focus()
        //enable

        if(error){
            return console.log(error)
        }
        console.log('This message was delivered!')
    })

})

$locationButton.addEventListener('click' , () => {
    if (!navigator.geolocation){
        return alert('not Supported!')
    }

    $locationButton.setAttribute('disabled' , 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        $locationButton.removeAttribute('disabled')
        socket.emit('location' , {
            lat : position.coords.latitude,
            long : position.coords.longitude
        } , 
        (message) => {
            console.log('Location send successfully!')
            return console.log(message)
        })
    })
})



socket.emit('join' ,  {username , room} , (error) => {
    if(error){
        alert(error)
        location.href='/'
    }
})
