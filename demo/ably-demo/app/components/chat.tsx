"use client";

import React, { useEffect, useState, useRef } from "react";
import { Card, Input, Button, List, Avatar, message as antMessage } from "antd";
import { SendOutlined, UserOutlined } from "@ant-design/icons";
import { useAbly } from "../providers/ably-provider";
import type { Types } from "ably";

/**
 * Chat Component
 * 
 * Implements Core Pub/Sub Pattern with:
 * - Message publishing and subscribing
 * - History API recovery for suspended state
 * - Connection state monitoring
 * - Channel attachment with resume detection
 * 
 * Best Practices Applied:
 * - Ephemeral channel usage (no pre-provisioning)
 * - History API recovery when resumed: false
 * - Subscribe before publishing
 * 
 * Anti-Patterns Avoided:
 * - Channel proliferation (logical grouping: chat:general)
 * - Ignored state loss (History API recovery implemented)
 */
interface ChatMessage {
  id: string;
  text: string;
  user: string;
  timestamp: number;
}

interface MessageData {
  text: string;
  user: string;
}

export function Chat({ channelName }: { channelName: string }) {
  const { ably } = useAbly();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [clientId, setClientId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ably) return;

    // Get or generate clientId
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setClientId(id);

    // Get channel instance
    // Pattern: Ephemeral channel - exists only when referenced
    // Best Practice: Logical grouping (chat:general), not per-user granularity
    const channel = ably.channels.get(channelName);

    // Monitor channel attachment with resume flag
    // Best Practice: Check resumed flag to detect state loss
    channel.on("attached", async (stateChange: Types.ChannelStateChange) => {
      // History API Recovery Workaround
      // When resumed: false, state continuity is lost (disconnected >2 minutes)
      // Recover missing messages using History API
      if (stateChange.resumed === false) {
        console.log("State continuity lost - recovering message history");
        try {
          const history = await channel.history({ limit: 50 });
          // Process missed messages in chronological order
          const recoveredMessages: ChatMessage[] = history.items
            .reverse()
            .map((msg) => ({
              id: msg.id || `${msg.timestamp}-${Math.random()}`,
              text: (msg.data as MessageData).text || String(msg.data),
              user: (msg.data as MessageData).user || "System",
              timestamp: msg.timestamp || Date.now(),
            }));
          setMessages((prev) => [...recoveredMessages, ...prev]);
          antMessage.info(`Recovered ${recoveredMessages.length} missed messages`);
        } catch (error) {
          console.error("History recovery error:", error);
          antMessage.error("Failed to recover message history");
        }
      }
    });

    // Subscribe to messages
    // Best Practice: Subscribe before publishing
    const messageSubscription = channel.subscribe(
      (message: Types.Message) => {
        const data = message.data as MessageData;
        const chatMessage: ChatMessage = {
          id: message.id || `${message.timestamp}-${Math.random()}`,
          text: data?.text || String(message.data),
          user: data?.user || "Unknown",
          timestamp: message.timestamp || Date.now(),
        };
        setMessages((prev) => [...prev, chatMessage]);
      }
    );

    // Cleanup
    return () => {
      messageSubscription.unsubscribe();
      channel.detach();
    };
  }, [ably, channelName]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || !ably) return;

    try {
      const channel = ably.channels.get(channelName);
      const messageData: MessageData = {
        text: inputValue,
        user: `User ${clientId.slice(-6)}`,
      };

      // Publish message
      await channel.publish("message", messageData);
      setInputValue("");
    } catch (error) {
      console.error("Publish error:", error);
      antMessage.error("Failed to send message");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card
      title="Real-time Chat"
      extra={<div className="text-sm text-gray-500">Channel: {channelName}</div>}
    >
      <div className="flex flex-col h-[500px]">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto mb-4">
          <List
            dataSource={messages}
            renderItem={(msg) => (
              <List.Item className="!px-0">
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} />}
                  title={
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{msg.user}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  }
                  description={msg.text}
                />
              </List.Item>
            )}
          />
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            size="large"
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={sendMessage}
            size="large"
            disabled={!inputValue.trim()}
          >
            Send
          </Button>
        </div>
      </div>
    </Card>
  );
}

