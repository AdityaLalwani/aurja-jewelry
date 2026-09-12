"use client";

import { useEffect, useState } from "react";
import type { BlogPost } from "@/lib/blogs";
import { submitSubscription } from "@/lib/subscribe";
import { ArrowRightIcon, XIcon } from "../components/icons";

export function BlogGrid({ posts }: { posts: BlogPost[] }) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [journalOpen, setJournalOpen] = useState(false);
  const [journalJoined, setJournalJoined] = useState(false);
  const [journalError, setJournalError] = useState("");
  const [journalSubmitting, setJournalSubmitting] = useState(false);

  useEffect(() => {
    if (!selectedPost) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedPost(null);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedPost]);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, index) => (
          <button
            key={post.number}
            type="button"
            onClick={() => {
              setSelectedPost(post);
              setJournalOpen(false);
              setJournalJoined(false);
              setJournalError("");
              setJournalSubmitting(false);
            }}
            className={`group flex min-h-64 flex-col justify-between rounded-[1.5rem] border border-stone-200 bg-white/75 p-6 text-left transition-all duration-500 hover:-translate-y-1 hover:border-amber-300 hover:bg-white hover:shadow-[0_18px_45px_rgba(120,78,24,0.09)] motion-safe:animate-fade-up sm:p-7 ${
              index === 0 ? "lg:col-span-2" : ""
            } ${index === 1 ? "[animation-delay:100ms]" : ""} ${
              index === 2 ? "[animation-delay:180ms]" : ""
            } ${index === 3 ? "[animation-delay:260ms]" : ""} ${
              index === 4 ? "[animation-delay:340ms]" : ""
            } ${index === 5 ? "[animation-delay:420ms]" : ""} ${
              index === 6 ? "[animation-delay:500ms]" : ""}`}
          >
            <div className="flex items-start justify-between gap-5">
              <span className="font-display text-4xl leading-none text-stone-300 transition-colors duration-500 group-hover:text-amber-600">
                {post.number}
              </span>
              <ArrowRightIcon className="h-5 w-5 text-amber-700 transition-transform duration-500 group-hover:translate-x-1" />
            </div>
            <div>
              <h2 className="mt-10 max-w-md font-display text-2xl font-medium leading-tight text-stone-900">
                {post.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-stone-500">
                {post.intro}
              </p>
              <span className="mt-7 block h-px w-8 bg-amber-700/50 transition-all duration-500 group-hover:w-16" />
            </div>
          </button>
        ))}
      </div>

      {selectedPost ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/45 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedPost(null);
          }}
        >
          <article
            role="dialog"
            aria-modal="true"
            aria-labelledby="blog-modal-title"
            className="max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-t-[2rem] bg-[#faf7f2] p-6 shadow-2xl motion-safe:animate-fade-up sm:rounded-[2rem] sm:p-10"
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.3em] text-amber-700">
                  Aurja Journal · {selectedPost.number}
                </p>
                <h2
                  id="blog-modal-title"
                  className="mt-4 max-w-2xl font-display text-3xl font-medium leading-tight text-stone-900 sm:text-5xl"
                >
                  {selectedPost.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                aria-label="Close article"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-200 text-stone-500 transition-colors hover:border-amber-600 hover:text-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/50"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-8 border-y border-stone-200 py-6">
              <p className="font-display text-xl italic leading-relaxed text-stone-700 sm:text-2xl">
                {selectedPost.intro}
              </p>
            </div>

            <div className="mt-8 space-y-5 text-base leading-relaxed text-stone-600 sm:text-lg">
              {selectedPost.paragraphs.map((paragraph, index) => {
                const isJournalInvite =
                  selectedPost.number === "07" &&
                  index === selectedPost.paragraphs.length - 1;

                if (isJournalInvite) {
                  return (
                    <div key={paragraph} className="pt-3">
                      <button
                        type="button"
                        onClick={() => {
                          setJournalOpen(true);
                          setJournalError("");
                        }}
                        className="group inline-flex items-center gap-3 border-b border-amber-700 pb-2 font-display text-xl text-stone-900 transition-colors hover:border-stone-900 hover:text-amber-700 sm:text-2xl"
                      >
                        {paragraph}
                        <ArrowRightIcon className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                      </button>

                      {journalOpen ? (
                        <form
                          className="mt-7 rounded-2xl border border-stone-200 bg-white/70 p-5 sm:p-6"
                          onSubmit={async (event) => {
                            event.preventDefault();
                            if (journalSubmitting) return;
                            const form = new FormData(event.currentTarget);
                            const email = String(form.get("journal-email") ?? "").trim();
                            const whatsapp = String(form.get("journal-whatsapp") ?? "").trim();

                            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                              setJournalError("Please enter a valid email address.");
                              return;
                            }
                            if (!whatsapp || whatsapp.replace(/\D/g, "").length < 10) {
                              setJournalError("Please enter a valid WhatsApp number.");
                              return;
                            }

                            setJournalError("");
                            setJournalSubmitting(true);
                            try {
                              await submitSubscription({
                                email,
                                whatsapp,
                                source: "journal",
                              });
                              setJournalJoined(true);
                            } catch {
                              setJournalError("Unable to join right now. Please try again.");
                            } finally {
                              setJournalSubmitting(false);
                            }
                          }}
                        >
                          {journalJoined ? (
                            <p className="text-sm font-medium leading-relaxed text-amber-800" aria-live="polite">
                              You are on the list. We will send the next Aurja Journal to you.
                            </p>
                          ) : (
                            <>
                              <p className="text-xs font-medium uppercase tracking-[0.22em] text-amber-700">
                                Join the journal
                              </p>
                              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <label className="text-sm text-stone-600">
                                  <span className="sr-only">Email address</span>
                                  <input
                                    name="journal-email"
                                    type="email"
                                    placeholder="Email address"
                                    autoComplete="email"
                                    required
                                    className="h-12 w-full rounded-xl border border-stone-200 bg-[#faf7f2] px-4 text-sm text-stone-900 outline-none transition-colors placeholder:text-stone-400 focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20"
                                  />
                                </label>
                                <label className="text-sm text-stone-600">
                                  <span className="sr-only">WhatsApp number</span>
                                  <input
                                    name="journal-whatsapp"
                                    type="tel"
                                    placeholder="WhatsApp number"
                                    autoComplete="tel"
                                    required
                                    className="h-12 w-full rounded-xl border border-stone-200 bg-[#faf7f2] px-4 text-sm text-stone-900 outline-none transition-colors placeholder:text-stone-400 focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20"
                                  />
                                </label>
                              </div>
                              {journalError ? (
                                <p className="mt-3 text-xs text-red-700" role="alert">
                                  {journalError}
                                </p>
                              ) : null}
                              <button
                                type="submit"
                                disabled={journalSubmitting}
                                className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-stone-900 px-6 text-sm font-medium tracking-wide text-amber-50 transition-colors hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/50 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {journalSubmitting ? "Joining..." : "Join the Aurja Journal"}
                              </button>
                            </>
                          )}
                        </form>
                      ) : null}
                    </div>
                  );
                }

                return <p key={paragraph}>{paragraph}</p>;
              })}
              {selectedPost.bullets ? (
                <ul className="list-disc space-y-3 pl-5 marker:text-amber-700">
                  {selectedPost.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </article>
        </div>
      ) : null}
    </>
  );
}
