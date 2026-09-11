"use strict";
const node = (tag, text, className) => {
  const el = document.createElement(tag);
  if (text) el.textContent = text;
  if (className) el.className = className;
  return el;
};
fetch("content.json").then(response => {
  if (!response.ok) throw new Error("Content unavailable");
  return response.json();
}).then(data => {
  for (const section of ["hardware", "software"]) {
    if (data[section].length) document.getElementById(section).replaceChildren(...data[section].map(text => node("li", text)));
  }
  const entries = [...data.entries].sort((a, b) => b.date.localeCompare(a.date));
  if (!entries.length) return;
  document.getElementById("count").textContent = `${entries.length} ${entries.length === 1 ? "post" : "posts"}`;
  document.getElementById("entries").replaceChildren(...entries.map(entry => {
    const article = node("article", "", "entry");
    article.id = entry.slug;
    article.append(node("p", `${entry.date} / ${entry.context}`, "meta"), node("h3", entry.title), node("p", entry.text));
    if (entry.next) article.append(node("p", `Next: ${entry.next}`));
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
    return article;
  }));
}).catch(() => { document.getElementById("error").hidden = false; });
