const socket = io()

//Elements
const $messageForm = document.getElementById('formId');
const $messageFormInput = document.getElementById('inputId');
const $messageFormButton = document.getElementById('sendBtn')
const $locationFormButton = document.getElementById('sendLocation');
const $messages = document.getElementById('messages');
const $sidebar = document.getElementById('sidebar');

//Templates
const messageTemplate = document.getElementById('message-template').innerHTML;
const locationTemplate = document.getElementById('location-template').innerHTML;
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML;

//Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

// autoscroll
const autoscroll = function(){
    const $newMessage = $messages.lastElementChild;

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    const visibleHeight = $messages.offsetHeight;

    const containerHeight = $messages.scrollHeight;

    const scrollOffset = $messages.scrollTop + visibleHeight;

    if((containerHeight - newMessageHeight) <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight;
    }
}


socket.on('message', function(msg){
    const html = Mustache.render(messageTemplate, {
        username: msg.username,
        message: msg.text,
        createdAt: moment(msg.createdAt).format('hh:mm A')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', function(msg){
    const html = Mustache.render(locationTemplate, {
        username: msg.username,
        link: msg.url,
        createdAt: moment(msg.createdAt).format('hh:mm A')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', function({room, users}){
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    $sidebar.innerHTML = html;
})

$messageForm.addEventListener('submit', function(e){
    e.preventDefault();

    $messageFormButton.setAttribute('disabled', 'disabled');


    socket.emit('sendMessage', $messageFormInput.value, function(error){
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus()
        if(error){
            console.log(error)
        }
        else{
            console.log('Message delivered')
        }
    })
})

$locationFormButton.addEventListener('click', function(e){
    if(!navigator.geolocation) return alert('Geolocation is not suported by your browser.')

    $locationFormButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude, 
            longitude: position.coords.longitude
        }, function(error){
            $locationFormButton.removeAttribute('disabled');

            if(error) console.log('Error sharing location')
            else console.log('Location shared')
        })
    })
})

socket.emit('join', {username, room}, function(error){
    if(error){
        alert(error)
        location.href = '/';
    }
})