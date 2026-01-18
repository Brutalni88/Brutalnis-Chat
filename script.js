// --- CONFIG ---
const PUSHER_KEY = "52d32fe20e7fcc47f6f9";
const CLUSTER = "eu";
const ADMIN_PASS = "ACC19240ADMIN05143";
let isTimedOut = false;

// --- PUSHER SETUP ---
// We use a dummy authorizer because we don't have a backend server
const pusher = new Pusher(PUSHER_KEY, { 
    cluster: CLUSTER, 
    forceTLS: true,
    userAuthentication: { endpoint: "https://null" },
    channelAuthorization: { endpoint: "https://null" }
});

// MUST start with 'private-' for client events to work saar!
const channel = pusher.subscribe('private-chat'); 

channel.bind('client-msg', function(data) {
    if (data.type === 'img') {
        renderImg(data.name, data.text);
    } else {
        renderText(data.name, data.text);
    }
});

channel.bind('client-timeout', function(data) {
    renderText("SYSTEM", `${data.target} has been timed out.`, "#ff4444");
    if (document.getElementById('nameInput').value === data.target) {
        isTimedOut = true;
        setTimeout(() => { isTimedOut = false; }, 300000);
    }
});

// --- UI LOGIC ---
const msgInput = document.getElementById('msgInput');
const nameInput = document.getElementById('nameInput');

msgInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        if (isTimedOut) { alert("You are timed out geg."); return; }
        
        let val = msgInput.value.trim();
        let username = nameInput.value || "Unnamed";
        if (!val) return;

        if (val.startsWith('/timeout ')) {
            if (document.getElementById('adminKey').value === ADMIN_PASS) {
                let target = val.replace('/timeout @', '').replace('/timeout ', '');
                channel.trigger('client-timeout', { target: target });
            } else {
                renderText("SYSTEM", "Wrong Admin Key lol.", "#ff4444");
            }
        } 
        else if (val.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
            channel.trigger('client-msg', { name: username, text: val, type: 'img' });
            renderImg(username, val);
        } 
        else {
            channel.trigger('client-msg', { name: username, text: val, type: 'text' });
            renderText(username, val);
        }
        msgInput.value = '';
    }
});

function renderText(user, text, color = "white") {
    let div = document.createElement('div');
    div.style.marginBottom = "10px";
    div.innerHTML = `<b style="color: grey">${user}:</b> <span style="color: ${color}">${text}</span>`;
    document.getElementById('messages').appendChild(div);
    document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
}

function renderImg(user, url) {
    let div = document.createElement('div');
    div.style.marginBottom = "10px";
    div.innerHTML = `<b style="color: grey">${user}:</b><br><img src="${url}">`;
    document.getElementById('messages').appendChild(div);
    document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
}
