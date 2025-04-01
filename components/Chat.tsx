"use client";

import { useUser } from "@clerk/nextjs";
import { FormEvent, useEffect, useState, useTransition } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection, query, orderBy } from "firebase/firestore";
import { Loader2, Loader2Icon } from "lucide-react";
import { db } from "@/firebase";
import { askQuestion } from "@/actions/askQuestion";

export type Message = {
  id?: string;
  role: "human" | "ai" | "placeholder";
  message: string;
  createdAt: Date;
};

function Chat({ id }: { id: string }) {
  const { user } = useUser();
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [messages, setMessages] = useState<Message[]>([]);

  const [snapshot, loading, error] = useCollection(
    user &&
      query(
        collection(db, "userrs", user.id, "files", id, "chat"),
        orderBy("createdAt", "asc")
      )
  );
  useEffect(() => {
    if (!snapshot) return;
    console.log("Updated snapshot", snapshot.docs);
    const lastMessage = messages.pop();

    if (lastMessage?.role === "ai" && lastMessage.message === "Thinking") {
      return;
    }

    const newMessages = snapshot.docs.map((doc) => {
      const { role, message, createdAt } = doc.data();

      return {
        id: doc.id,
        role,
        message,
        createdAt: createdAt.toDate(),
      };
    });

    setMessages(newMessages);
  }, [snapshot]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input) return;
    const q = input;

    setInput("");

    setMessages((prev) => [
      ...prev,
      { role: "human", message: q, createdAt: new Date() },
      { role: "ai", message: "Thinking", createdAt: new Date() },
    ]);
    startTransition(async () => {
      const { success, message } = await askQuestion(id, q);

      if (!success) {
        setMessages((prev) =>
          prev.slice(0, prev.length - 1).concat([
            {
              role: "ai",
              message: `Whoops... ${message}`,
              createdAt: new Date(),
            },
          ])
        );
      }
    });
  };
  return (
    <div className="flex flex-col h-full overflow-scroll ">
      {/* Chat contents */}
      <div className="flex-1 w-full">
        {/* Chat messages */}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "human" ? "items-start" : "items-end"
            } mb-2 px-4 py-2 rounded-md ${
              message.role === "human" ? "bg-white" : "bg-blue-600 text-white"
            }`}
          >
            {message.message}
          </div>
        ))}
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex sticky bottom-0 space-x-2 p-5 bg-blue-600/75"
      >
        <Input
          placeholder="Ask a question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button disabled={!input || isPending}>
          {isPending ? (
            <Loader2Icon className="animate-spin text-blue-600" />
          ) : (
            "Ask"
          )}
        </Button>
      </form>
    </div>
  );
}

export default Chat;
