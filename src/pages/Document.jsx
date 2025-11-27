import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import axios from "axios";
import * as Y from "yjs";
import { io } from "socket.io-client";
import { Collaboration } from "@tiptap/extension-collaboration";
import { VersionSidebar } from "../components/versionSidebar";
import {
  createVersion,
  rollbackVersion,
  getVersions,
} from "../services/documentService";
import { useNavigate } from "react-router-dom";

// Inside your component
export const Document = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const documentId = id;
  const location = useLocation();
  const workspaceFromState = location.state?.document?.workspace || null;
  const role = location.state?.role || "viewer";

  const [documentData, setDocumentData] = useState({
    title: "Untitled Document",
    content: { type: "doc", content: [] },
    createdAt: null,
    updatedAt: null,
    creator: null,
    updater: null,
    workspace: workspaceFromState,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [versions, setVersions] = useState([]);

  const [ydoc] = useState(() => new Y.Doc());
  const [socket] = useState(() =>
    io("https://backend-app-chi-ten.vercel.app/")
  );
  const fileInputRef = useRef(null);
  const lastSavedRef = useRef(null);

  // ------------------- Editor -------------------
  const CustomImage = Image.extend({
    addAttributes() {
      return {
        src: { default: null },
        width: { default: "300px" },
        height: { default: "auto" },
      };
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      CustomImage,
      Collaboration.configure({ document: ydoc }),
    ],
    editable: role.toLowerCase() !== "viewer",
  });

  // ------------------- Fetch document -------------------
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `https://backend-app-chi-ten.vercel.app/documents/${documentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.content && res.data.content.length > 0) {
          Y.applyUpdate(ydoc, new Uint8Array(res.data.content));
        } else {
          const initialUpdate = Y.encodeStateAsUpdate(ydoc);
          await axios.patch(
            `https://backend-app-chi-ten.vercel.app/documents/${documentId}`,
            { content: Array.from(initialUpdate) },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }

        setDocumentData((prev) => ({ ...prev, ...res.data }));

        if (res.data.versions) setVersions(res.data.versions);
      } catch (err) {
        setError("Document not found or server error.");
      } finally {
        setLoading(false);
      }
    };
    fetchDocument();
  }, [documentId, ydoc]);

  // ------------------- Socket Collaboration -------------------
  useEffect(() => {
    if (!editor) return;
    const userId = "user-" + Math.random();
    socket.emit("join-document", {
      docId: documentId,
      user: { id: userId, name: "Me", role },
    });

    socket.on("load-document", (update) => {
      try {
        Y.applyUpdate(ydoc, new Uint8Array(update));
      } catch (err) {
        console.error(err);
      }
    });

    socket.on("receive-changes", (update) => {
      try {
        Y.applyUpdate(ydoc, new Uint8Array(update));
      } catch (err) {
        console.error(err);
      }
    });

    const emitUpdate = (update) => {
      socket.emit("send-changes", { docId: documentId, update });
    };
    ydoc.on("update", emitUpdate);

    return () => {
      socket.off("load-document");
      socket.off("receive-changes");
      ydoc.off("update", emitUpdate);
    };
  }, [editor, socket, ydoc, documentId]);

  // ------------------- Save version -------------------
  const handleSaveVersion = async () => {
    try {
      const data = await createVersion(documentId, editor.getJSON());
      console.log("Saved version:", data);
    } catch (err) {
      console.error(err);
    }
  };

  // ------------------- Rollback handler -------------------
  const handleRollback = async (documentId, versionId) => {
    if (!versionId) return alert("Version ID missing");
    try {
      const result = await rollbackVersion(documentId, versionId);
      alert(result.message);
      // Optionally, you can apply the rolled-back content to editor
      if (editor) {
        Y.applyUpdate(ydoc, new Uint8Array(result.content));
      }
      // Refresh versions
      const v = await getVersions(documentId);
      setVersions(v);
    } catch (err) {
      console.error(err);
      alert("Rollback failed");
    }
  };

  // ------------------- Image Upload -------------------
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = "";
    try {
      const token = localStorage.getItem("token");
      const form = new FormData();
      form.append("file", file);

      const uploadRes = await axios.post(
        "https://backend-app-chi-ten.vercel.app/files/upload",
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const key = uploadRes.data.key;
      const urlRes = await axios.get(
        "https://backend-app-chi-ten.vercel.app/files/signed-url",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { key },
        }
      );

      const imageUrl = urlRes.data.url;
      editor
        ?.chain()
        ?.focus()
        ?.setImage({ src: imageUrl, width: "300px", height: "auto" })
        ?.run();
    } catch (err) {
      console.error(err.response || err);
      alert("Image upload failed.");
    }
  };

  if (loading) return <p className="p-8 text-center">Loading...</p>;
  if (error) return <p className="p-8 text-center text-red-600">{error}</p>;
  if (!editor) return <p className="p-8 text-center">Editor loading...</p>;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-yellow-200 via-pink-100 to-purple-200">
      {/* Header */}
      <div className="px-8 py-4 bg-white/20 backdrop-blur-md shadow-md flex justify-between items-center rounded-b-2xl">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {documentData.title}{" "}
            <span className="text-sm font-normal text-gray-700">({role})</span>
          </h1>
          {documentData.workspace && (
            <p className="text-gray-700 italic mt-1">
              Workspace: {documentData.workspace.name}
            </p>
          )}
          <p className="text-sm text-gray-800 mt-1">
            Created At:{" "}
            {documentData.createdAt
              ? new Date(documentData.createdAt).toLocaleString()
              : "N/A"}
          </p>
          <p className="text-sm text-gray-800">
            Updated At:{" "}
            {documentData.updatedAt
              ? new Date(documentData.updatedAt).toLocaleString()
              : "N/A"}
          </p>
        </div>
        <div>
          {role.toLowerCase() !== "viewer" && (
            <button
              onClick={handleSaveVersion}
              className="px-4 py-2 m-2 bg-green-400  rounded-xl font-bold transition hover:bg-green-500 hover:cursor-pointer"
            >
              Save
            </button>
          )}
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-gray-800 rounded-lg font-bold"
          >
            ← Back
          </button>{" "}
        </div>
      </div>

      {/* Toolbar */}
      {role.toLowerCase() !== "viewer" && (
        <div className="px-8 py-4 flex space-x-2 bg-white/30 backdrop-blur-md rounded-t-2xl shadow-md">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`px-3 py-1 rounded font-bold ${
              editor.isActive("bold") ? "bg-gray-300" : ""
            }`}
          >
            B
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`px-3 py-1 rounded italic ${
              editor.isActive("italic") ? "bg-gray-300" : ""
            }`}
          >
            I
          </button>
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className={`px-3 py-1 rounded ${
              editor.isActive("heading", { level: 1 }) ? "bg-gray-300" : ""
            }`}
          >
            H1
          </button>
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={`px-3 py-1 rounded ${
              editor.isActive("heading", { level: 2 }) ? "bg-gray-300" : ""
            }`}
          >
            H2
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`px-3 py-1 rounded ${
              editor.isActive("bulletList") ? "bg-gray-300" : ""
            }`}
          >
            • List
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`px-3 py-1 rounded ${
              editor.isActive("orderedList") ? "bg-gray-300" : ""
            }`}
          >
            1. List
          </button>
          <button
            onClick={() => fileInputRef.current.click()}
            className="px-3 py-1 rounded bg-blue-400 hover:bg-blue-500 text-white"
          >
            📷 Image
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileSelect}
          />
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 p-8">
        <div className="bg-white/30 backdrop-blur-sm p-6 rounded-2xl shadow-md min-h-[400px]">
          <EditorContent editor={editor} className="editor-content" />
        </div>
        <VersionSidebar documentId={documentId} onRollback={handleRollback} />
      </div>
    </div>
  );
};
