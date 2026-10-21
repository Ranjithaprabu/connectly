
import { useRef, useState } from "react";
import {
  Camera,
  LoaderCircle,
  ImagePlus,
  Trash2,
  UserRound,
} from "lucide-react";

import "./AvatarUpload.css";

const API_BASE = "http://localhost:5000";

export default function AvatarUpload({
  token,
  currentAvatar,
  onUploaded,
}) {
  const inputRef = useRef(null);

  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const displayedAvatar = preview || currentAvatar || "";

  async function readResponse(response) {
    const text = await response.text();

    let data;

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      throw new Error(
        `The server returned an invalid response (HTTP ${response.status}). Check that the backend route exists and the backend is running.`
      );
    }

    if (!response.ok) {
      throw new Error(
        data.message || `Request failed (HTTP ${response.status}).`
      );
    }

    return data;
  }

  function handleChangeClick() {
    setMenuOpen(false);
    setError("");
    inputRef.current?.click();
  }

  async function handleUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Choose a JPG, PNG, WEBP, or GIF image.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be 2 MB or smaller.");
      event.target.value = "";
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch(
        `${API_BASE}/api/profile/avatar/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await readResponse(response);
      const avatarPath = data.user?.avatar_url;

      if (!avatarPath) {
        throw new Error(
          "Upload response did not include a profile picture URL."
        );
      }

      const avatarUrl = avatarPath.startsWith("http")
        ? avatarPath
        : `${API_BASE}${avatarPath}`;

      setPreview(avatarUrl);
      setImageFailed(false);
      onUploaded?.(avatarUrl);
    } catch (err) {
      setError(err.message || "Could not upload profile picture.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function handleRemove() {
    if (!displayedAvatar || removing || uploading) return;

    setMenuOpen(false);
    setRemoving(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE}/api/profile/avatar`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await readResponse(response);

      setPreview("");
      setImageFailed(false);
      onUploaded?.("");
    } catch (err) {
      setError(err.message || "Could not remove profile picture.");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="avatar-upload">
      <div className="avatar-upload__image-wrap">
        {displayedAvatar && !imageFailed ? (
          <img
            key={displayedAvatar}
            src={displayedAvatar}
            alt="Profile picture"
            className="avatar-upload__preview"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="avatar-upload__placeholder">
            <UserRound size={30} />
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleUpload}
          hidden
        />

        <button
          type="button"
          className="avatar-upload__camera"
          onClick={() => {
            setError("");
            setMenuOpen((open) => !open);
          }}
          disabled={uploading || removing}
          aria-label="Profile picture options"
          title="Profile picture options"
          aria-expanded={menuOpen}
        >
          {uploading || removing ? (
            <LoaderCircle
              size={17}
              className="avatar-upload__spinner"
            />
          ) : (
            <Camera size={17} />
          )}
        </button>

        {menuOpen && (
          <div className="avatar-upload__menu">
            <button
              type="button"
              onClick={handleChangeClick}
              disabled={uploading || removing}
            >
              <ImagePlus size={17} />
              <span>
                {displayedAvatar ? "Change picture" : "Add picture"}
              </span>
            </button>

            {displayedAvatar && (
              <button
                type="button"
                className="avatar-upload__remove"
                onClick={handleRemove}
                disabled={uploading || removing}
              >
                <Trash2 size={17} />
                <span>Remove picture</span>
              </button>
            )}
          </div>
        )}
      </div>

      {uploading && (
        <p className="avatar-upload__status">
          Uploading picture...
        </p>
      )}

      {removing && (
        <p className="avatar-upload__status">
          Removing picture...
        </p>
      )}

      {error && (
        <p className="avatar-upload__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
