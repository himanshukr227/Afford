import React, { useState } from "react";
import { LoggingProvider, useLogger } from "./LoggingContext";

// Util to generate unique string
const generateShortId = (existing) => {
  let id;
  do {
    id = Math.random().toString(36).substr(2, 5); // 5 chars
  } while (existing.has(id));
  return id;
};

const DEFAULT_VALIDITY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const InputForm = ({ onCreate }) => {
  const [url, setUrl] = useState("");
  const [validity, setValidity] = useState("");

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        if (!url) return;
        onCreate(url, validity);
        setUrl("");
        setValidity("");
      }}
    >
      <input
        type="text"
        placeholder="Enter long URL"
        value={url}
        onChange={e => setUrl(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Validity (days, optional)"
        value={validity}
        onChange={e => setValidity(e.target.value)}
        min={1}
      />
      <button type="submit">Shorten</button>
    </form>
  );
};

const ShortLinksList = ({ links, onAccess }) =>
  <div>
    <h3>Short Links</h3>
    <ul>
      {links.map(link =>
        <li key={link.shortId}>
          <a
            href="#"
            onClick={e => {
              e.preventDefault();
              onAccess(link.shortId);
            }}
          >{`${window.location.origin}/${link.shortId}`}</a>
          <span> → {link.url}</span>
          <span> | Used: {link.analytics.count}</span>
        </li>
      )}
    </ul>
  </div>;


const AppContent = () => {
  const { logEvent, logs } = useLogger();
  const [links, setLinks] = useState([]);

  const existingIds = new Set(links.map(l => l.shortId));
  const createShort = (url, validity) => {
    const validityMs = validity ? parseInt(validity, 10) * 24 * 60 * 60 * 1000 : DEFAULT_VALIDITY_MS;
    const expiry = Date.now() + validityMs;
    const shortId = generateShortId(existingIds);

    setLinks(prev => [
      ...prev,
      {
        shortId,
        url,
        expiry,
        analytics: { count: 0 }
      }
    ]);
    logEvent("CREATE", "Created shortlink", { url, shortId, expiry });
  };

  const accessLink = shortId => {
    setLinks(arr => arr.map(l => l.shortId === shortId
      ? { ...l, analytics: { count: l.analytics.count + 1 } }
      : l
    ));
    logEvent("ACCESS", "Accessed shortlink", { shortId });
  };

  return (
    <div>
      <h2>URL Shortener</h2>
      <InputForm onCreate={createShort} />
      <ShortLinksList links={links} onAccess={accessLink} />
      <h3>Analytics</h3>
      <ul>
        {links.map(link => (
          <li key={link.shortId}>
            {`${link.shortId}: Accessed ${link.analytics.count} times`}
          </li>
        ))}
      </ul>
      <h3>Logs</h3>
      <ul>
        {logs.map((log, i) => (
          <li key={i}>
            [{new Date(log.timestamp).toLocaleString()}] {log.type} - {log.message} {JSON.stringify(log.meta)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default function App() {
  return (
    <LoggingProvider>
      <AppContent />
    </LoggingProvider>
  );
}
