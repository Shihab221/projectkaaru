"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ArrowLeft,
  Video,
} from "lucide-react";
import { useAppSelector } from "@/redux/hooks";
import {
  selectIsAdmin,
  selectIsAuthenticated,
  selectAuthInitialized,
} from "@/redux/slices/authSlice";
import toast from "react-hot-toast";
import Image from "next/image";
import { extractYouTubeVideoId, youtubeThumbnailUrl } from "@/lib/youtube";

interface Tutorial {
  id: string;
  title: string;
  shortDescription: string | null;
  youtubeUrl: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const emptyForm = {
  title: "",
  shortDescription: "",
  youtubeUrl: "",
  sortOrder: "0",
};

export default function AdminTutorialsPage() {
  const router = useRouter();
  const isAdmin = useAppSelector(selectIsAdmin);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const authInitialized = useAppSelector(selectAuthInitialized);

  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editing, setEditing] = useState<Tutorial | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (authInitialized && (!isAuthenticated || !isAdmin)) {
      router.replace("/auth?redirect=/admin/tutorials");
    }
  }, [authInitialized, isAuthenticated, isAdmin, router]);

  useEffect(() => {
    if (authInitialized && isAuthenticated && isAdmin) {
      fetchTutorials();
    }
  }, [authInitialized, isAuthenticated, isAdmin]);

  const fetchTutorials = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/tutorials");
      const data = await res.json();
      if (res.ok) {
        setTutorials(data.tutorials || []);
      } else {
        toast.error(data.message || "Failed to fetch tutorials");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch tutorials");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/tutorials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          shortDescription: formData.shortDescription,
          youtubeUrl: formData.youtubeUrl,
          sortOrder: formData.sortOrder,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Tutorial added");
        setShowAddModal(false);
        setFormData(emptyForm);
        fetchTutorials();
      } else {
        toast.error(data.message || "Failed to add tutorial");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to add tutorial");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      const res = await fetch(`/api/admin/tutorials/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          shortDescription: formData.shortDescription,
          youtubeUrl: formData.youtubeUrl,
          sortOrder: formData.sortOrder,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Tutorial updated");
        setShowEditModal(false);
        setEditing(null);
        setFormData(emptyForm);
        fetchTutorials();
      } else {
        toast.error(data.message || "Failed to update tutorial");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update tutorial");
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/admin/tutorials/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Updated");
        fetchTutorials();
      } else {
        toast.error(data.message || "Failed to update");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this tutorial? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/tutorials/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Tutorial deleted");
        fetchTutorials();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to delete");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete");
    }
  };

  const openEdit = (t: Tutorial) => {
    setEditing(t);
    setFormData({
      title: t.title,
      shortDescription: t.shortDescription || "",
      youtubeUrl: t.youtubeUrl,
      sortOrder: String(t.sortOrder),
    });
    setShowEditModal(true);
  };

  if (!authInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container-custom py-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-primary text-sm font-medium mb-6 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary flex items-center gap-3">
              <Video className="w-8 h-8 text-primary" />
              YouTube tutorials
            </h1>
            <p className="text-gray-500 mt-1">
              Add video links with a title and short description. Lowest sort
              order appears first on the Tutorial page.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setFormData(emptyForm);
              setShowAddModal(true);
            }}
            className="btn btn-primary inline-flex items-center gap-2 self-start md:self-auto"
          >
            <Plus className="w-5 h-5" />
            Add tutorial
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
          </div>
        ) : tutorials.length === 0 ? (
          <div className="card p-12 text-center text-gray-500">
            <Video className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="font-medium text-secondary">No tutorials yet</p>
            <p className="text-sm mt-1">
              Paste a YouTube URL and publish your first tutorial.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {tutorials.map((t, index) => {
              const vid = extractYouTubeVideoId(t.youtubeUrl);
              const thumb = vid ? youtubeThumbnailUrl(vid) : null;
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.05, 0.3) }}
                  className="card overflow-hidden flex flex-col"
                >
                  <div className="relative aspect-video bg-gray-900">
                    {thumb ? (
                      <Image
                        src={thumb}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-white/70 text-sm">
                        Invalid YouTube URL
                      </div>
                    )}
                    {!t.isActive && (
                      <span className="absolute top-2 right-2 px-2 py-1 rounded bg-black/70 text-white text-xs font-medium">
                        Hidden
                      </span>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <p className="text-xs text-gray-400 mb-1">
                      Sort order: {t.sortOrder}
                    </p>
                    <h3 className="font-semibold text-secondary mb-2 line-clamp-2">
                      {t.title}
                    </h3>
                    {t.shortDescription && (
                      <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-1">
                        {t.shortDescription}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-auto pt-2">
                      <button
                        type="button"
                        onClick={() => openEdit(t)}
                        className="btn btn-outline px-3 py-2 text-xs inline-flex items-center gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(t.id, t.isActive)}
                        className="btn btn-outline px-3 py-2 text-xs inline-flex items-center gap-1"
                      >
                        {t.isActive ? (
                          <ToggleLeft className="w-4 h-4" />
                        ) : (
                          <ToggleRight className="w-4 h-4" />
                        )}
                        {t.isActive ? "Hide" : "Show"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(t.id)}
                        className="btn btn-outline px-3 py-2 text-xs text-red-600 border-red-200 hover:bg-red-50 inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold text-secondary mb-4">
              {showEditModal ? "Edit tutorial" : "Add tutorial"}
            </h2>
            <form
              onSubmit={showEditModal ? handleEdit : handleAdd}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">
                  Title *
                </label>
                <input
                  required
                  className="input w-full"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="e.g. Assembly guide — desk organizer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">
                  Short description
                </label>
                <textarea
                  rows={3}
                  className="input w-full resize-y min-h-[80px]"
                  value={formData.shortDescription}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      shortDescription: e.target.value,
                    }))
                  }
                  placeholder="A sentence or two shown next to the video."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">
                  YouTube link *
                </label>
                <input
                  required
                  className="input w-full"
                  value={formData.youtubeUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      youtubeUrl: e.target.value,
                    }))
                  }
                  placeholder="https://www.youtube.com/watch?v=… or youtu.be/…"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">
                  Sort order
                </label>
                <input
                  type="number"
                  className="input w-full"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      sortOrder: e.target.value,
                    }))
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  Lower numbers appear first on the public Tutorial page.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn btn-primary flex-1">
                  {showEditModal ? "Save changes" : "Publish"}
                </button>
                <button
                  type="button"
                  className="btn btn-outline flex-1"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setEditing(null);
                    setFormData(emptyForm);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
