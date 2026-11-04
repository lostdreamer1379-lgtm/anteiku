import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/services/auth/supabaseClient";

export type WatchPartyCommand =
  | { action: "play"; position: number }
  | { action: "pause"; position: number }
  | { action: "seek"; position: number }
  | { action: "end" };

export interface WatchPartyParticipant {
  id: string;
  name: string;
  account: string;
  isHost: boolean;
}

function createRoomId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID().slice(0, 8);
  return Math.random().toString(36).slice(2, 10);
}

export function useWatchParty(
  animeId: number,
  episode: number,
  roomId: string | undefined,
  participant?: WatchPartyParticipant,
) {
  const [room, setRoom] = useState(roomId || "");
  const [connected, setConnected] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const onCommandRef = useRef<(command: WatchPartyCommand) => void>(() => undefined);
  const [isHost, setIsHost] = useState(!roomId);
  const [ended, setEnded] = useState(false);
  const [participants, setParticipants] = useState<WatchPartyParticipant[]>([]);

  useEffect(() => {
    if (!room) return;
    const channel = supabase.channel(`watch-party:${room}`, { config: { broadcast: { self: false } } });
    channelRef.current = channel;
    channel.on("presence", { event: "sync" }, () => {
      const presence = channel.presenceState<WatchPartyParticipant>();
      const next = Object.values(presence).flat().filter((person) => person?.id);
      setParticipants(next);
    });
    channel.on("broadcast", { event: "command" }, ({ payload }) => {
      if (payload?.animeId !== animeId || payload?.episode !== episode || !payload?.command) return;
      const command = payload.command as WatchPartyCommand;
      if (command.action === "end") {
        setEnded(true);
        setRoom("");
        return;
      }
      onCommandRef.current(command);
    }).subscribe((status) => {
      const joined = status === "SUBSCRIBED";
      setConnected(joined);
      if (joined && participant) void channel.track({ ...participant, isHost: participant.isHost || isHost });
    });
    return () => {
      channelRef.current = null;
      void supabase.removeChannel(channel);
      setConnected(false);
      setParticipants([]);
    };
  }, [animeId, isHost, participant, room]);

  const createParty = useCallback(() => {
    const nextRoom = createRoomId();
    setIsHost(true);
    setEnded(false);
    setRoom(nextRoom);
    return nextRoom;
  }, []);

  const send = useCallback((command: WatchPartyCommand) => {
    if (!channelRef.current || !connected) return;
    void channelRef.current.send({ type: "broadcast", event: "command", payload: { animeId, episode, command } });
  }, [animeId, connected, episode]);

  const endParty = useCallback(() => {
    if (!isHost || !channelRef.current || !connected) return;
    void channelRef.current.send({
      type: "broadcast",
      event: "command",
      payload: { animeId, episode, command: { action: "end" } },
    });
    setEnded(true);
    setRoom("");
  }, [animeId, connected, episode, isHost]);

  const onCommand = useCallback((handler: (command: WatchPartyCommand) => void) => {
    onCommandRef.current = handler;
    return () => { if (onCommandRef.current === handler) onCommandRef.current = () => undefined; };
  }, []);

  return { room, connected, isHost, ended, participants, createParty, endParty, send, onCommand };
}
