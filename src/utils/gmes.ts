import gmesData from "@/data/gmes.json";
import { fetch } from "@/utils/fetch.ts";

const FILTER_OPTIMIZE_ON = import.meta.env.PUBLIC_FILTER_OPTIMIZE === "true";
const gmes_text = FILTER_OPTIMIZE_ON ? "gᾰmes" : "games";

(() => {
  const target = document.querySelector("#gmeContainer");
  const searchInput = document.getElementById("search");

  searchInput.placeholder = `Search from ${gmesData.length} ${gmes_text}`;

  if (!target) {
    console.error("Target container #gmeContainer not found.");
    return;
  }

  if (!searchInput) {
    console.error("Search input with id 'search' not found.");
    return;
  }

  target.innerHTML = `<p style='text-align: center; font-family: sans-serif; color: #555;'>Loading ${gmes_text}...</p>`;

  const allGmes = [...gmesData].sort((a, b) =>
    a.title.localeCompare(b.title, undefined, { sensitivity: "base" }),
  );

  const renderGmes = (gmesToRender) => {
    if (gmesToRender.length === 0) {
      target.innerHTML = `<p style='text-align: center; font-family: sans-serif; color: #555;'>No ${gmes_text} found.</p>`;
      return;
    }

    target.innerHTML = `
  <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; padding: 10px;">
    ${gmesToRender
      .map(
        (gme) => `
      <div
        onclick="opengme('${gme.file_name}', '${gme.title}', '${gme.frame}')"
        class="bg-bg border border-overlay rounded-xl p-3 m-2 inline-block w-64 text-center shadow-sm transition-transform duration-200 hover:scale-105 cursor-pointer"
      >
        <h3 class="mt-2 font-medium  truncate">${gme.title}</h3>
      </div>
    `,
      )
      .join("")}
  </div>
`;
  };

  searchInput.addEventListener("input", (event) => {
    const searchQuery = event.target.value.toLowerCase();
    const filteredGmes = allGmes.filter((gme) =>
      gme.title.toLowerCase().includes(searchQuery),
    );
    renderGmes(filteredGmes);
  });

  renderGmes(allGmes);

  window.opengme = async (file_name, title, frameGme) => {
    const frame = document.getElementById("gmePageFrame");
    const container = document.getElementById("gmePageContainer");
    const titleEl = document.getElementById("gmePageTitle");

    titleEl.textContent = title;
    container.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    if (frameGme == "true") {
      // Directly load raw.githack URL
      frame.src = `https://raw.githack.com/Bromine-Labs/asseting-bromine/main/${file_name}`;
    } else {
      delete frame.dataset.loaded;
      frame.onload = async () => {
        if (frame.dataset.loaded) return;
        const doc = frame.contentDocument;

        const html = await fetch(
          `https://raw.githubusercontent.com/Bromine-Labs/asseting-bromine/main/${file_name}`,
        ).then((r) => r.text());

        doc.open();
        doc.write(html);
        doc.close();

        // Re-run scripts
        doc.querySelectorAll("script").forEach((s) => {
          const script = doc.createElement("script");
          script.src = s.src || "";
          if (!s.src) script.textContent = s.textContent;
          s.replaceWith(script);
        });

        frame.dataset.loaded = true;
      };

      frame.src = "/asdf.html";
    }
  };

  window.closegme = () => {
    const gmePageContainer = document.getElementById("gmePageContainer");
    const gmePageFrame = document.getElementById("gmePageFrame");

    gmePageFrame.src = "";
    gmePageContainer.classList.add("hidden");
    document.body.style.overflow = "";
  };

  document.getElementById("backBtn").addEventListener("click", () => {
    closegme();
  });
  document.getElementById("fullscreenBtn").addEventListener("click", () => {
    document.getElementById("gmePageFrame").requestFullscreen();
  });
})();
