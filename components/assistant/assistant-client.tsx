"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PaperPlaneRight, ChatCircleDots, Broom, Sparkle } from "@phosphor-icons/react";
import { assistantReply } from "@/lib/engine/assistant";
import { useAppStore, useHasMounted } from "@/lib/store";
import { PageHeader } from "@/components/travel/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const OPENERS = [
  "Where should I go in December on a budget?",
  "Do I need a visa for Japan?",
  "What should I pack for Iceland?",
  "How much is a week in Lisbon for two?",
];

function Bubble({ message }: { message: { role: "user" | "assistant"; content: string } }) {
  return (
    <div className={message.role === "user" ? "flex justify-end" : "flex justify-start"}>
      <div
        className={
          message.role === "user"
            ? "max-w-[85%] rounded-3xl rounded-br-lg bg-ocean-strong px-4 py-2.5 text-sm text-white md:max-w-[70%]"
            : "max-w-[85%] rounded-3xl rounded-bl-lg border border-line bg-raised px-4 py-2.5 text-sm text-ink md:max-w-[70%]"
        }
      >
        {message.content}
      </div>
    </div>
  );
}

export function AssistantClient() {
  const mounted = useHasMounted();
  const chat = useAppStore((s) => s.chat);
  const trips = useAppStore((s) => s.trips);
  const currency = useAppStore((s) => s.prefs.currency);
  const pushChat = useAppStore((s) => s.pushChat);
  const clearChat = useAppStore((s) => s.clearChat);

  const [input, setInput] = React.useState("");
  const [thinking, setThinking] = React.useState(false);
  const [streaming, setStreaming] = React.useState<string | null>(null);
  const [suggestions, setSuggestions] = React.useState<string[]>(OPENERS);
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const timersRef = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chat.length, streaming, thinking]);

  React.useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach(clearTimeout);
  }, []);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || thinking || streaming !== null) return;

    pushChat({ role: "user", content: trimmed });
    setInput("");
    setThinking(true);

    timersRef.current.push(
      setTimeout(() => {
        const reply = assistantReply(trimmed, { trips, currency });
        setThinking(false);
        setSuggestions(reply.suggestions);

        // Word-by-word reveal, then commit to the store
        const words = reply.content.split(" ");
        let i = 0;
        const step = () => {
          i += 2;
          setStreaming(words.slice(0, i).join(" "));
          if (i < words.length) {
            timersRef.current.push(setTimeout(step, 28));
          } else {
            setStreaming(null);
            pushChat({ role: "assistant", content: reply.content });
          }
        };
        step();
      }, 650)
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-3xl flex-col px-4 py-10 md:px-8 lg:min-h-[100dvh]">
      <PageHeader
        title="Travel Assistant"
        description="Visas, seasons, budgets, packing, and honest opinions about where to go."
        actions={
          mounted && chat.length > 0 ? (
            <Button variant="ghost" size="sm" onClick={clearChat}>
              <Broom size={14} /> Clear
            </Button>
          ) : undefined
        }
      />

      {/* Thread */}
      <div className="mt-8 flex flex-1 flex-col gap-3">
        {!mounted ? (
          <>
            <Skeleton className="h-12 w-2/3 self-start rounded-3xl" />
            <Skeleton className="h-12 w-1/2 self-end rounded-3xl" />
          </>
        ) : chat.length === 0 && !thinking && streaming === null ? (
          <div className="dot-grid flex flex-1 flex-col items-center justify-center rounded-3xl border border-dashed border-line-strong px-6 py-14 text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-ocean/10 text-ocean">
              <ChatCircleDots size={26} weight="fill" />
            </div>
            <h2 className="font-display text-lg font-semibold tracking-tight">Ask me anything travel</h2>
            <p className="mt-1.5 max-w-sm text-sm text-ink-muted">
              I know the destinations in Explore inside out, and I can see your saved trips.
            </p>
          </div>
        ) : (
          <>
            {chat.map((m) => (
              <Bubble key={m.id} message={m} />
            ))}
            <AnimatePresence>
              {thinking && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-center gap-1.5 rounded-3xl rounded-bl-lg border border-line bg-raised px-4 py-3">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="size-1.5 rounded-full bg-ink-faint"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {streaming !== null && <Bubble message={{ role: "assistant", content: streaming }} />}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions + input */}
      <div className="sticky bottom-0 mt-6 bg-gradient-to-t from-canvas via-canvas to-transparent pb-4 pt-2">
        <div className="mb-3 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              className="focus-ring cursor-pointer rounded-full border border-line-strong bg-surface px-3 py-1.5 text-[13px] text-ink-muted backdrop-blur-sm transition-colors hover:border-ocean/50 hover:text-ink"
            >
              {s}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="glass-strong flex items-center gap-2 rounded-full p-2 transition-shadow focus-within:shadow-[0_0_0_2px_var(--color-ocean)]"
        >
          <span className="ml-3 shrink-0 text-ocean">
            <Sparkle size={17} weight="fill" />
          </span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about anywhere"
            aria-label="Message the travel assistant"
            className="w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-faint"
          />
          <button
            type="submit"
            disabled={!input.trim() || thinking || streaming !== null}
            aria-label="Send message"
            className="focus-ring flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-ocean-strong text-white transition-all hover:bg-ocean-pressed active:scale-95 disabled:opacity-40"
          >
            <PaperPlaneRight size={16} weight="fill" />
          </button>
        </form>
      </div>
    </div>
  );
}
