
import {
    MessageCircle,
    Search,
    LogOut,
    ShieldCheck,
    UserRound,
  } from "lucide-react";
  
  import "./Sidebar.css";
  import { API } from "../api/client";
  
  export default function Sidebar({
    selected,
    setSelected,
    onLogout,
    onOpenProfile,
    user,
    search,
    setSearch,
    filteredContacts,
    setError,
    sidebarOpen,
  }) {
    const avatarUrl = user?.avatar_url
      ? user.avatar_url.startsWith("http")
        ? user.avatar_url
        : `${API}${user.avatar_url}`
      : "";
  
    return (
      <aside
        className={`sidebar ${
          selected ? "sidebar-hidden-mobile" : ""
        } ${sidebarOpen === false ? "sidebar-collapsed" : ""}`}
      >
        <header className="sidebar-header">
          <div className="brand-inline">
            <div className="brand-mark small">
              <MessageCircle size={20} />
            </div>
  
            <div>
              <h1>Connectly</h1>
         
            </div>
          </div>
  
          <div className="sidebar-header-actions">
            {/* Logged-in user's profile picture */}
            <button
              className="sidebar-profile-button"
              type="button"
              onClick={onOpenProfile}
              title="My Profile"
              aria-label="My Profile"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="My profile"
                  className="sidebar-profile-image"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <UserRound size={20} />
              )}
            </button>
  
            {/* Logout */}
            <button
              className="icon-btn"
              type="button"
              onClick={onLogout}
              title="Log out"
              aria-label="Log out"
            >
              <LogOut size={19} />
            </button>
          </div>
        </header>
  
        {/* Search contacts */}
        <div className="contact-search">
          <Search size={18} />
  
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search people..."
            aria-label="Search contacts"
          />
        </div>
  
        {/* Contact count */}
        <div className="contact-heading">
          <span>YOUR CONTACTS</span>
          <span>{filteredContacts.length}</span>
        </div>
  
        {/* Contacts */}
        <div className="contact-list">
          {filteredContacts.length === 0 ? (
            <div className="empty-contacts">
              <MessageCircle size={28} />
  
              <p>
                {search
                  ? "No matching contacts."
                  : "No other verified users yet."}
              </p>
  
              <span>
                Create another verified account to start chatting.
              </span>
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <button
                key={contact.id}
                type="button"
                className={`contact-item ${
                  selected?.id === contact.id ? "active" : ""
                }`}
                onClick={() => {
                  setSelected(contact);
                  setError("");
                }}
              >
                {contact.avatar_url ? (
                  <img
                    src={
                      contact.avatar_url.startsWith("http")
                        ? contact.avatar_url
                        : `${API}${contact.avatar_url}`
                    }
                    alt={`${contact.name || "User"}'s profile`}
                    className="avatar profile-avatar"
                  />
                ) : (
                  <div className="avatar">
                    {(contact.name || contact.email || "?")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}
  
                <div className="contact-details">
                  <strong>{contact.name}</strong>
                  <span>{contact.email}</span>
                </div>
              </button>
            ))
          )}
        </div>
  
        {/* Footer */}
        <footer className="sidebar-footer">
          <ShieldCheck size={16} />
          <span>Your conversations are authenticated.</span>
        </footer>
      </aside>
    );
  }
  