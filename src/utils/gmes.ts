import gmesData from "@/assets/gmes.json";
import { getProxied } from "@/utils/lethal.ts";

(() => {
    const target = document.querySelector("#gmeContainer");

    if (!target) {
        console.error("Target container #gmeContainer not found.");
        return;
    }

    target.innerHTML = "<p style='text-align: center; font-family: sans-serif; color: #555;'>Loading gmes...</p>";

    const gmePageContainerHtml = `
        <div id="gmePageContainer" style="
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #fff;
            z-index: 999;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            padding: 20px;
            box-sizing: border-box;
            overflow: auto;
        ">
            <button onclick="closegme()" style="
                position: absolute;
                top: 10px;
                right: 10px;
                padding: 10px 15px;
                font-size: 16px;
                cursor: pointer;
                background-color: #dc3545;
                color: white;
                border: none;
                border-radius: 5px;
                z-index: 1000;
            ">Close Gme</button>
            <h2 id="gmePageTitle" style="margin-top: 20px; color: #333;"></h2>
            <iframe id="gmePageFrame" src="" frameborder="0" style="
                width: 100%;
                height: calc(100% - 70px);
                border: none;
                margin-top: 10px;
            "></iframe>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', gmePageContainerHtml);

    const allGmes = gmesData;
    let currentPage = 1;
    const gmesPerPage = 20;

    const renderGmes = () => {
        const startIndex = (currentPage - 1) * gmesPerPage;
        const gmesToShow = allGmes.slice(startIndex, startIndex + gmesPerPage);
        const totalPages = Math.ceil(allGmes.length / gmesPerPage);

        const gmesHtml = gmesToShow.map(gme => `
            <div
              onclick="opengme('${gme.url}', '${gme.title}')"
              class="bg-base border border-overlay rounded-xl p-3 m-2 inline-block w-48 text-center shadow-sm transition-transform duration-200 hover:scale-105 cursor-pointer"
            >
              <img
                src="/images/${gme.alt}.webp"
                alt="${gme.title} thumbnail"
                class="w-full h-28 object-cover rounded-md"
                onerror="this.onerror=null;this.src='https://placehold.co/200x120/cccccc/333333?text=No+Image';"
              />
              <h3 class="mt-2 font-medium text-text truncate">${gme.title}</h3>
            </div>
        `).join('');

        const paginationHtml = `
            <div id="pagination-controls" style="text-align: center; margin-top: 20px; width: 100%;">
                <button id="prev-page" ${currentPage === 1 ? 'disabled' : ''} style="padding: 10px 20px; font-size: 16px; cursor: pointer; background-color: ${currentPage === 1 ? '#ccc' : '#007bff'}; color: white; border: none; border-radius: 5px; margin-right: 10px;">Previous</button>
                <span style="margin: 0 10px; font-family: sans-serif;">Page ${currentPage} of ${totalPages}</span>
                <button id="next-page" ${currentPage < totalPages ? '' : 'disabled'} style="padding: 10px 20px; font-size: 16px; cursor: pointer; background-color: ${currentPage < totalPages ? '#007bff' : '#ccc'}; color: white; border: none; border-radius: 5px; margin-left: 10px;">Next</button>
            </div>
        `;

        target.innerHTML = `<div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; padding: 10px;">${gmesHtml}</div>${paginationHtml}`;
    };

    target.addEventListener('click', (event) => {
        const totalPages = Math.ceil(allGmes.length / gmesPerPage);
        if (event.target.id === 'prev-page' && currentPage > 1) {
            currentPage--;
            renderGmes();
        }
        if (event.target.id === 'next-page' && currentPage < totalPages) {
            currentPage++;
            renderGmes();
        }
    });

    renderGmes();


    window.opengme = async (url, title) => {
        const gmePageContainer = document.getElementById("gmePageContainer");
        const gmePageFrame = document.getElementById("gmePageFrame");
        const gmePageTitle = document.getElementById("gmePageTitle");

        gmePageTitle.textContent = title;
        gmePageFrame.src = await getProxied(url);
        gmePageContainer.style.display = "flex";
        document.body.style.overflow = 'hidden';
    };

    window.closegme = () => {
        const gmePageContainer = document.getElementById("gmePageContainer");
        const gmePageFrame = document.getElementById("gmePageFrame");

        gmePageFrame.src = "";
        gmePageContainer.style.display = "none";
        document.body.style.overflow = '';
    };

		document.getElementById("backBtn").addEventListener("click", () => {
			closegme();
		})
		document.getElementById("fullscreenBtn").addEventListener("click", () => {
			document.getElementById("gmePageFrame").requestFullscreen();
		})
})();
