// Connect to the network (No dashboard needed!)
const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
const chat = gun.get('brutalnis-void-chat');

const msgInput = document.getElementById('msgInput');
const nameInput = document.getElementById('nameInput');
const messagesDiv = document.getElementById('messages');
const ADMIN_PASS = "ACC19240ADMIN05143";

// --- SENDING ---
msgInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        let val = msgInput.value.trim();
        let username = nameInput.value || "Unnamed";
        if (!val) return;

        // Detect if it's an image
        let type = val.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? 'img' : 'text';

        // Save to the decentralized graph
        chat.set({ name: username, text: val, type: type, time: Date.now() });
        msgInput.value = '';
    }
});

// --- RECEIVING ---
chat.map().once((data) => {
    if (!data || !data.name || !data.text) return;

    // Only show messages from the last 24 hours (The Purge)
    if (Date.now() - data.time > 86400000) return;

    let div = document.createElement('div');
    div.style.marginBottom = "10px";
    
    if (data.type === 'img') {
        div.innerHTML = `<b style="color:grey">${data.name}:</b><br><img src="${data.text}" style="max-width:300px; border-radius:8px;">`;
    } else {
        div.innerHTML = `<b style="color:grey">${data.name}:</b> <span>${data.text}</span>`;
    }

    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});
