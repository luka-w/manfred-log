"use strict";
const copyEmail = document.getElementById("copy-email");
if (copyEmail) {
  copyEmail.addEventListener("click", async () => {
    const status = document.getElementById("copy-status");
    status.textContent = "";
    try {
      await navigator.clipboard.writeText(document.getElementById("contact-email").textContent.trim());
      status.textContent = "Copied!";
    } catch {
      const range = document.createRange();
      range.selectNodeContents(document.getElementById("contact-email"));
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
      status.textContent = "Could not copy automatically. Copy the selected address manually.";
    }
  });
}
const node = (tag, text, className) => {
  const el = document.createElement(tag);
  if (text) el.textContent = text;
  if (className) el.className = className;
  return el;
};
// Public embed identifier supplied by Remarkbox; not a login credential.
const remarkboxOwner = "67ef1d2d-adcd-11f1-992d-040140774501";
let remarkboxResizer;
function loadRemarkboxResizer() {
  if (!remarkboxResizer) remarkboxResizer = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://my.remarkbox.com/static/js/iframe-resizer/iframeResizer.min.js";
    script.onload = resolve;
    script.onerror = reject;
    document.head.append(script);
  });
  return remarkboxResizer;
}
function commentsFor(entry) {
  const section = node("details", "", "comments");
  section.id = `comments-${entry.slug}`;
  section.append(node("summary", "Comments"));
  const notice = node("p", "Comments are hosted by Remarkbox. Opening this section connects to their service.", "meta");
  // One stable, public URL per entry; never send localhost or tracking queries.
  const thread = new URL("https://luka-w.github.io/manfred-log/");
  thread.searchParams.set("post", entry.slug);
  const source = new URL("https://my.remarkbox.com/embed");
  source.searchParams.set("rb_owner_key", remarkboxOwner);
  source.searchParams.set("thread_title", `${entry.title} — Manfred`);
  source.searchParams.set("thread_uri", thread.href);
  source.searchParams.set("mode", "light");
  const fallback = node("a", "Open comments in a new tab");
  fallback.href = source.href;
  fallback.target = "_blank";
  fallback.rel = "noopener noreferrer";
  section.append(notice, fallback);
  let loaded = false;
  section.addEventListener("toggle", () => {
    if (!section.open || loaded) return;
    loaded = true;
    const frame = node("iframe", "", "comments-frame");
    frame.id = `remarkbox-${entry.slug}`;
    frame.title = `Comments on ${entry.title}`;
    frame.src = source.href;
    frame.referrerPolicy = "strict-origin-when-cross-origin";
    section.append(frame);
    loadRemarkboxResizer().then(() => {
      window.iFrameResize({checkOrigin: ["https://my.remarkbox.com"], inPageLinks: true}, frame);
    }).catch(() => {
      // Keep a scrollable frame and the direct link if the resize script fails.
      notice.textContent += " Automatic sizing is unavailable; scroll inside the comments or use the link above.";
    });
  });
  return section;
}
fetch("content.json").then(response => {
  if (!response.ok) throw new Error("Content unavailable");
  return response.json();
}).then(data => {
  for (const section of ["hardware", "software", "specifications"]) {
    if (data[section].length) document.getElementById(section).replaceChildren(...data[section].map(text => node("li", text)));
  }
  const entries = [...data.entries].sort((a, b) => b.date.localeCompare(a.date));
  if (!entries.length) return;
  document.getElementById("count").textContent = `${entries.length} ${entries.length === 1 ? "post" : "posts"}`;
  document.getElementById("entries").replaceChildren(...entries.map(entry => {
    const article = node("article", "", "entry");
    article.id = entry.slug;
    article.append(node("p", `${entry.date} / ${entry.context}`, "meta"), node("h3", entry.title));
    for (const paragraph of entry.text.split(/\n\s*\n/)) article.append(node("p", paragraph));
    const clips = entry.videos || (entry.video ? [{src: entry.video, caption: entry.title}] : []);
    for (const clip of clips) {
      // Only explicit local public media; never embed arbitrary HTML or remote URLs.
      if (!/^media\/[a-zA-Z0-9_/-]+\.mp4$/.test(clip.src)) throw new Error("Invalid media path");
      const figure = node("figure");
      const video = node("video");
      video.controls = true; video.preload = "metadata"; video.playsInline = true;
      video.src = clip.src; video.setAttribute("aria-label", clip.caption);
      video.poster = clip.src.replace(/\.mp4$/, ".jpg");
      figure.append(video, node("figcaption", clip.caption));
      article.append(figure);
    }
    if (entry.images?.length) {
      const gallery = node("div", "", "image-gallery");
      for (const picture of entry.images) {
        if (!/^media\/[a-zA-Z0-9_/-]+\.(png|jpg|webp)$/.test(picture.src)) throw new Error("Invalid image path");
        const figure = node("figure");
        const link = node("a");
        link.href = picture.src; link.target = "_blank"; link.rel = "noopener";
        const img = node("img");
        img.src = picture.src; img.alt = picture.caption;
        img.loading = "lazy"; img.decoding = "async";
        link.append(img);
        figure.append(link, node("figcaption", picture.caption));
        gallery.append(figure);
      }
      article.append(gallery);
    }
    article.append(commentsFor(entry));
    return article;
  }));
  const selected = new URLSearchParams(window.location.search).get("post");
  if (selected && entries.some(entry => entry.slug === selected)) {
    document.getElementById(`comments-${selected}`).open = true;
    document.getElementById(selected).scrollIntoView();
  }
}).catch(() => { document.getElementById("error").hidden = false; });
