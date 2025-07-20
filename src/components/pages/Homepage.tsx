// pages/index.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { wallpapers as staticWallpapers } from "@/lib/wallpapers";

export default function HomePage() {
  const [filter, setFilter] = useState("all");
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("stable-diffusion-xl");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [activeWallpaper, setActiveWallpaper] = useState<string | null>(null);

  const filteredWallpapers =
    filter === "all"
      ? staticWallpapers
      : staticWallpapers.filter((wp) => wp.type === filter);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, model }),
      });
      const data = await res.json();
      setGeneratedImage(data.imageUrl);
    } catch (error) {
      console.error("Generation failed", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (url: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = "techinika-wallpaper.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-white text-center p-4">
      <h1 className="text-5xl font-bold mb-2">Techinika Wallpapers</h1>
      <p className="text-gray-600 mb-8 text-lg">
        Explore and generate beautiful wallpapers
      </p>

      <div className="mb-6 flex justify-center gap-3 flex-wrap">
        {["all", "phone", "desktop"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-full text-white transition ${
              filter === type ? "bg-blue-600" : "bg-blue-400 hover:bg-blue-500"
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}

        <Dialog>
          <DialogTrigger asChild>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full">
              Generate with AI
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl w-full">
            <DialogHeader>
              <DialogTitle>Generate a Wallpaper</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the wallpaper you want..."
                className="w-full p-3 border rounded-md"
              />
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="stable-diffusion-xl">Stable Diffusion XL</option>
                <option value="kandinsky-2.2">Kandinsky 2.2</option>
              </select>
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {isGenerating ? "Generating..." : "Generate"}
              </button>

              {generatedImage && (
                <div className="mt-4">
                  <p className="mb-2 font-medium">Generated Wallpaper:</p>
                  <Image
                    src={generatedImage}
                    alt="Generated"
                    width={512}
                    height={512}
                    className="rounded shadow"
                  />
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
        {filteredWallpapers.map((wallpaper, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.05 }}
            onClick={() => setActiveWallpaper(wallpaper.src)}
            className="cursor-pointer rounded overflow-hidden shadow-md bg-white"
          >
            <Image
              src={wallpaper.src}
              alt="Wallpaper"
              width={400}
              height={300}
              className="object-cover w-full aspect-[9/16] md:aspect-[16/9]"
            />
          </motion.div>
        ))}
      </div>

      {/* Fullscreen image viewer */}
      <Dialog
        open={!!activeWallpaper}
        onOpenChange={() => setActiveWallpaper(null)}
      >
        <DialogContent className="w-full max-w-5xl p-6">
          <DialogHeader>
            <DialogTitle>View Wallpaper</DialogTitle>
          </DialogHeader>
          {activeWallpaper && (
            <div className="flex flex-col items-center space-y-4">
              <Image
                src={activeWallpaper}
                alt="Fullscreen Wallpaper"
                width={900}
                height={600}
                className="rounded max-h-[70vh] w-auto h-auto object-contain"
              />
              <div className="flex gap-4">
                <Button
                  onClick={() => handleDownload(activeWallpaper)}
                  className="bg-green-600 text-white"
                >
                  Download
                </Button>
                <Button variant="outline">Add to Favorites</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
