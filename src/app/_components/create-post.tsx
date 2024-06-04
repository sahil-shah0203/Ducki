"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "~/trpc/react";

export function CreatePost() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [content, setContent] = useState("");

  const createPost = api.post.create.useMutation({
    onSuccess: () => {
      router.refresh();
      setName("");
      setContent(""); // Reset the content field
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        createPost.mutate({ name, content }); // Include content here
      }}
      className="flex flex-col gap-2"
    >
      <input
        type="text"
        placeholder="Title"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-full px-4 py-2 text-black"
      />
      <textarea
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full rounded-full px-4 py-2 text-black"
      />
      <button
        type="submit"
        className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
        disabled={createPost.isPending}
      >
        {createPost.isPending ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}