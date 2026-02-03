function toggleChat() {
    const chat = document.getElementById("chat-window");
    chat.style.display = chat.style.display === "flex" ? "none" : "flex";
}

async function sendChat() {
    const input = document.getElementById("chat-input");
    const messages = document.getElementById("chat-messages");

    if (!input.value.trim()) return;

    messages.innerHTML += `
        <div class="chat-user"><span>${input.value}</span></div>
    `;

    const userText = input.value;
    input.value = "";

    try {
        const res = await fetch("http://localhost:5000/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userText })
        });

        const data = await res.json();

        messages.innerHTML += `
            <div class="chat-bot"><span>${data.reply}</span></div>
        `;
    } catch (err) {
        messages.innerHTML += `
            <div class="chat-bot"><span>⚠️ Backend not running</span></div>
        `;
    }

    messages.scrollTop = messages.scrollHeight;
}

/* ===== FIX: ENTER KEY SUPPORT ===== */
document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("chat-input");

    if (input) {
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                sendChat();
            }
        });
    }
});
