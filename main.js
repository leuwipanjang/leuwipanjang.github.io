import { getJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/api.min.js";
import { setInner, setInnerText } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/element.min.js";
import { getLocal, setLocalWithExpireHour } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/storage.min.js";

const REPO = "leuwipanjang/leuwipanjang";
const CACHE_KEY = "latestRelease";

// The download links in the page work on their own; this only adds the version and sizes.
// The GitHub API allows 60 unauthenticated requests per hour per IP, often shared on mobile
// networks, so one answer is reused for an hour.
async function latestRelease() {
  const cached = getLocal(CACHE_KEY);
  if (cached) return cached;

  const { status, data } = await getJSON(`https://api.github.com/repos/${REPO}/releases/latest`, null);
  if (status !== 200 || !data) return null;

  const sizeOf = ext => data.assets.find(a => a.name.endsWith("." + ext))?.size;
  const release = {
    tag: data.tag_name,
    publishedAt: data.published_at,
    apkSize: sizeOf("apk"),
    aabSize: sizeOf("aab"),
  };
  setLocalWithExpireHour(CACHE_KEY, release, 1);
  return release;
}

const megabytes = bytes => (bytes / 1048576).toFixed(1) + " MB";

const release = await latestRelease();
if (release) {
  if (release.apkSize) setInnerText("dl-apk-info", `Direct install · ${megabytes(release.apkSize)}`);
  if (release.aabSize) setInnerText("dl-aab-info", `Play Store upload · ${megabytes(release.aabSize)}`);
  const date = new Date(release.publishedAt).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" });
  setInnerText("dl-version", `${release.tag} · ${date}`);
} else {
  setInner("dl-version", `<a href="https://github.com/${REPO}/releases/latest" target="_blank" rel="noopener">Release notes on GitHub</a>`);
}
