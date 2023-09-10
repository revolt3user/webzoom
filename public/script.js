const socket = io('/')
    // const socket = io('wss://mido.desktop');
    // const socket = io('http://localhost:3000');
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, undefined)
    // const myPeer = new Peer(undefined, {
    //     host: 'localhost',
    //     port: 3001,
    //     secure: false, // Establecer a false para usar HTTP en lugar de HTTPS
    //     // path: '/peerjs' // Esto es importante para que PeerJS funcione correctamente en rutas relativas
    // })
const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}

async function Main() {
    let stream = await navigator.mediaDevices.getUserMedia({ /* video: true, */ audio: true })
        // let streamAudio = await navigator.mediaDevices.getUserMedia({ audio: true })
        // let streamScreen = await navigator.mediaDevices.getDisplayMedia({ video: true })


    addVideoStream(myVideo, stream)
    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream)
    })
}
Main();


// navigator.mediaDevices.getUserMedia({
//     // video: true,
//     audio: true
// }).then(stream => {

// })


socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}