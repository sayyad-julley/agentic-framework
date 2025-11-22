"use client";

import React, { useEffect, useState } from "react";
import { Card, List, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useAbly } from "../providers/ably-provider";
import type { Types } from "ably";

/**
 * Presence Component
 * 
 * Implements Presence Management pattern:
 * - Tracks users currently present on the channel
 * - Subscribes to presence events (enter, update, leave)
 * - Updates presence data in real-time
 * 
 * Best Practice: Use realtime presence for live awareness
 * Workaround: REST API available for historical occupancy snapshots
 */
interface PresenceData {
  name: string;
  status: string;
}

export function Presence({ channelName }: { channelName: string }) {
  const { ably } = useAbly();
  const [presenceMembers, setPresenceMembers] = useState<
    Types.PresenceMessage[]
  >([]);
  const [clientId, setClientId] = useState<string>("");

  useEffect(() => {
    if (!ably) return;

    // Get or generate clientId
    // In production, this would come from authenticated user session
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setClientId(id);

    // Get channel instance
    // Best Practice: Ephemeral channels - no pre-provisioning required
    const channel = ably.channels.get(channelName);

    // Enter presence set
    // Best Practice: Requires ClientId and presence capability in token
    channel.presence.enter({
      name: `User ${id.slice(-6)}`,
      status: "available",
    } as PresenceData);

    // Subscribe to presence events
    // Pattern: Realtime presence subscriptions for live awareness
    const presenceSubscription = channel.presence.subscribe(
      (presenceMessage: Types.PresenceMessage) => {
        if (presenceMessage.action === "enter" || presenceMessage.action === "update") {
          // Update presence members list
          setPresenceMembers((prev) => {
            const filtered = prev.filter(
              (m) => m.clientId !== presenceMessage.clientId
            );
            return [...filtered, presenceMessage];
          });
        } else if (presenceMessage.action === "leave") {
          // Remove from presence members list
          setPresenceMembers((prev) =>
            prev.filter((m) => m.clientId !== presenceMessage.clientId)
          );
        }
      }
    );

    // Get initial presence set
    channel.presence.get().then((presenceSet) => {
      setPresenceMembers(presenceSet);
    });

    // Cleanup: Leave presence set on unmount
    return () => {
      presenceSubscription.unsubscribe();
      channel.presence.leave();
    };
  }, [ably, channelName]);

  return (
    <Card title="Online Users" size="small">
      <List
        dataSource={presenceMembers}
        renderItem={(member) => {
          const data = member.data as PresenceData;
          return (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={data?.name || member.clientId}
                description={data?.status || "online"}
              />
            </List.Item>
          );
        }}
      />
      {presenceMembers.length === 0 && (
        <div className="text-center text-gray-400 py-4">No users online</div>
      )}
    </Card>
  );
}

