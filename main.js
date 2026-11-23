import { getJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.33/api.min.js";
import { setInner, setInnerText } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.33/element.min.js";

const REPO = "leuwipanjang/leuwipanjang";

// The download links in the page work on their own; this only adds the version and sizes.
// The GitHub API allows 60 unauthenticated requests per hour per IP, often shared on mobile
// networks, so one answer is reused for an hour without asking again. After that the request
// carries the stored ETag; GitHub still counts a 304 against the limit, but sends no body.
const { status, data } = await getJSON(`https://api.github.com/repos/${REPO}/releases/latest`, null, {
  cache: { key: "githubLatestRelease", ttl: 3600 },
});

const megabytes = bytes => (bytes / 1048576).toFixed(1) + " MB";

if (status === 200 && data) {
  const sizeOf = ext => data.assets.find(a => a.name.endsWith("." + ext))?.size;
  const apkSize = sizeOf("apk");
  const aabSize = sizeOf("aab");
  if (apkSize) setInnerText("dl-apk-info", `Direct install · ${megabytes(apkSize)}`);
  if (aabSize) setInnerText("dl-aab-info", `Play Store upload · ${megabytes(aabSize)}`);
  const date = new Date(data.published_at).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" });
  setInnerText("dl-version", `${data.tag_name} · ${date}`);
} else {
  setInner("dl-version", `<a href="https://github.com/${REPO}/releases/latest" target="_blank" rel="noopener">Release notes on GitHub</a>`);
}
