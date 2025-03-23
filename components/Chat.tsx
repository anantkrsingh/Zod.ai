"use client";

import { useUser } from "@clerk/nextjs";
import { FormEvent, useState, useTransition } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";


export type Message = {
    id?: string;
    role: "human" | "ai" | "placeholder";
    message: string;
    createdAt: Date;

}

function Chat({ id }: { id: string }) {


    const { user } = useUser();
    const [input, setInput] = useState("");
    const [isPending, startTransition] = useTransition();
    const [messages, setMessages] = useState<Message[]>([]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!input) return;
    }
    return (
        <div className="flex flex-col h-full overflow-scroll ">

            {/* Chat contents */}
            <div className="flex-1 w-full">

                {/* Chat messages */}

                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.role === "human" ? "items-start" : "items-end"} mb-2 px-4 py-2 rounded-md ${message.role === "human" ? "bg-white" : "bg-blue-600 text-white"}`}
                    >
                        {message.message}
                    </div>
                ))}

            </div>
            <form onSubmit={handleSubmit}>
                <Input placeholder="Ask a question..."
                    value={input}
                    onChange={
                        (e) => setInput(e.target.value)
                    }
                />
                <Button disabled={!input || isPending}>Ask</Button>
            </form>
        </div>
    )
}

export default Chat