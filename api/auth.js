import crypto from "crypto";

function getSecret() {
  return process.env.AUTH_SECRET || "";
}

function sign(value) {
  return crypto
    .createHmac("sha256", getSecret())
    .update(value)
    .digest("base64url");
}

function createToken(username) {
  const payload = Buffer.from(
    JSON.stringify({
      username,
      exp: Date.now() + 1000 * 60 * 60 * 24 * 30
    })
  ).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

function verifyToken(token) {
  if (!token || !getSecret()) return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payload, signature] = parts;
  const expected = sign(payload);

  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);

    if (
      a.length !== b.length ||
      !crypto.timingSafeEqual(a, b)
    ) {
      return null;
    }

    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString()
    );

    if (!data.username || data.exp < Date.now()) {
      return null;
    }

    return data.username;
  } catch {
    return null;
  }
}

function getCookie(req, name) {
  const cookies = req.headers.cookie || "";

  const match = cookies
    .split(";")
    .map(x => x.trim())
    .find(x => x.startsWith(name + "="));

  return match
    ? decodeURIComponent(match.substring(name.length + 1))
    : null;
}

export function getLoggedInUser(req) {
  return verifyToken(
    getCookie(req, "weil_session")
  );
}

export function requireAuth(req, res) {
  const username = getLoggedInUser(req);

  if (!username) {
    res.status(401).json({
      error: "Nicht angemeldet"
    });
    return null;
  }

  return username;
}

export default async function handler(req, res) {

  res.setHeader(
    "Content-Type",
    "application/json"
  );

if (req.method === "GET") {

  const username = getLoggedInUser(req);

  return res.status(200).json({
    loggedIn: !!username,
    username: username || null
  });
}
  if (req.method === "POST") {

    const {
      username,
      password
    } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({
        error: "Benutzername und Passwort erforderlich"
      });
    }

    const users = {
      [process.env.APP_USER_1]:
        process.env.APP_PASS_1,

      [process.env.APP_USER_2]:
        process.env.APP_PASS_2,

      [process.env.APP_USER_3]:
        process.env.APP_PASS_3
    };

    if (
      !users[username] ||
      users[username] !== password
    ) {
      return res.status(401).json({
        error: "Benutzername oder Passwort falsch"
      });
    }

    if (!getSecret()) {
      return res.status(500).json({
        error: "AUTH_SECRET fehlt"
      });
    }

    const token = createToken(username);

    res.setHeader(
      "Set-Cookie",
      `weil_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${process.env.NODE_ENV === "production" ? "; Secure" : ""}`
    );

    return res.status(200).json({
      ok: true,
      username
    });
  }

  if (req.method === "DELETE") {

    res.setHeader(
      "Set-Cookie",
      "weil_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"
    );

    return res.status(200).json({
      ok: true
    });
  }

  return res.status(405).json({
    error: "Method not allowed"
  });
}
