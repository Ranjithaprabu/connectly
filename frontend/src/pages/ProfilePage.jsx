
import {
  ArrowLeft,
  UserRound,
  Mail,
  ShieldCheck,
} from "lucide-react";

import AvatarUpload from "../components/AvatarUpload";
import "./ProfilePage.css";

export default function ProfilePage({
  user,
  token,
  avatarUrl,
  onAvatarUploaded,
  onBack,
}) {
  return (
    <main className="profile-page">
      <header className="profile-page-header">
        <button
          type="button"
          className="profile-back-btn"
          onClick={onBack}
          aria-label="Back to chats"
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <h1>My Profile</h1>
          <p>Manage your personal information</p>
        </div>
      </header>

      <section className="profile-card">
        <div className="profile-card-top">
          <AvatarUpload
            token={token}
            currentAvatar={avatarUrl}
            onUploaded={onAvatarUploaded}
          />

          <div className="profile-user-info">
            <h2>{user?.name || "Your Name"}</h2>
            <p>{user?.email || "Email not available"}</p>

            <span className="profile-status">
              <ShieldCheck size={15} />
              Verified account
            </span>
          </div>
        </div>

        <div className="profile-divider" />

        <h3>Account Information</h3>

        <div className="profile-detail">
          <div className="profile-detail-icon">
            <UserRound size={19} />
          </div>

          <div className="profile-detail-text">
            <span>Full Name</span>
            <strong>{user?.name || "Not provided"}</strong>
          </div>
        </div>

        <div className="profile-detail">
          <div className="profile-detail-icon">
            <Mail size={19} />
          </div>

          <div className="profile-detail-text">
            <span>Email Address</span>
            <strong>{user?.email || "Not available"}</strong>
          </div>
        </div>
      </section>
    </main>
  );
}
