import { getJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.37/api.min.js";
import { setInner, setInnerText } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.37/element.min.js";

const REPO = "leuwipanjang/leuwipanjang";

// The download links in the page work on their own; this only adds the version and sizes.
// The GitHub API allows 60 unauthenticated requests per hour per IP, often shared on mobile
// networks, so one answer is reused for an hour without asking again. After that, if the
// request fails (rate limited, offline), the last stored answer is shown instead, and while
// GitHub says the quota is used up (X-RateLimit-Reset) no request is sent at all.
// Only the four fields used below are stored, not the whole ~10 KB release.
const sizeOf = (assets, ext) => assets.find(a => a.name.endsWith("." + ext))?.size;
const { status, data } = await getJSON(`https://api.github.com/repos/${REPO}/releases/latest`, null, {
  cache: {
    key: "githubLatestRelease",
    ttl: 3600,
    staleIfError: true,
    select: release => ({
      tag: release.tag_name,
      publishedAt: release.published_at,
      apkSize: sizeOf(release.assets, "apk"),
      aabSize: sizeOf(release.assets, "aab"),
    }),
  },
});

const megabytes = bytes => (bytes / 1048576).toFixed(1) + " MB";

if (status === 200 && data) {
  if (data.apkSize) setInnerText("dl-apk-info", `Direct install · ${megabytes(data.apkSize)}`);
  if (data.aabSize) setInnerText("dl-aab-info", `Play Store upload · ${megabytes(data.aabSize)}`);
  const date = new Date(data.publishedAt).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" });
  setInnerText("dl-version", `${data.tag} · ${date}`);
} else {
  setInner("dl-version", `<a href="https://github.com/${REPO}/releases/latest" target="_blank" rel="noopener">Release notes on GitHub</a>`);
}
