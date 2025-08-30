import g2mesData from "@/assets/g2mes.json";
import { getProxied } from "@/utils/lethal.ts";

(() => {
    const target = document.querySelector("#g2meContainer");

    if (!target) {
        console.error("Target container #g2meContainer not found.");
        return;
    }

    target.innerHTML = "<p style='text-align: center; font-family: sans-serif; color: #555;'>Loading g2mes...</p>";

    const g2mePageContainerHtml = `
        <div id="g2mePageContainer" style="
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
            <button onclick="closeg2me()" style="
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
            ">Close G2me</button>
            <h2 id="g2mePageTitle" style="margin-top: 20px; color: #333;"></h2>
            <iframe id="g2mePageFrame" src="" frameborder="0" style="
                width: 100%;
                height: calc(100% - 70px);
                border: none;
                margin-top: 10px;
            "></iframe>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', g2mePageContainerHtml);

    const allG2mes = g2mesData;
    let currentPage = 1;
    const g2mesPerPage = 20;

    const renderG2mes = () => {
        const startIndex = (currentPage - 1) * g2mesPerPage;
        const g2mesToShow = allG2mes.slice(startIndex, startIndex + g2mesPerPage);
        const totalPages = Math.ceil(allG2mes.length / g2mesPerPage);

        const g2mesHtml = g2mesToShow.map(g2me => `
            <div
              onclick="openg2me('${g2me.url}', '${g2me.title}')"
              class="bg-base border border-overlay rounded-xl p-3 m-2 inline-block w-48 text-center shadow-sm transition-transform duration-200 hover:scale-105 cursor-pointer"
            >
              <img
                src="/images/${g2me.alt}.webp"
                alt="${g2me.title} thumbnail"
                class="w-full h-28 object-cover rounded-md"
                onerror="this.onerror=null;this.src='https://placehold.co/200x120/cccccc/333333?text=No+Image';"
              />
              <h3 class="mt-2 font-medium text-text truncate">${g2me.title}</h3>
            </div>
        `).join('');

        const paginationHtml = `
            <div id="pagination-controls" style="text-align: center; margin-top: 20px; width: 100%;">
                <button id="prev-page" ${currentPage === 1 ? 'disabled' : ''} style="padding: 10px 20px; font-size: 16px; cursor: pointer; background-color: ${currentPage === 1 ? '#ccc' : '#007bff'}; color: white; border: none; border-radius: 5px; margin-right: 10px;">Previous</button>
                <span style="margin: 0 10px; font-family: sans-serif;">Page ${currentPage} of ${totalPages}</span>
                <button id="next-page" ${currentPage < totalPages ? '' : 'disabled'} style="padding: 10px 20px; font-size: 16px; cursor: pointer; background-color: ${currentPage < totalPages ? '#007bff' : '#ccc'}; color: white; border: none; border-radius: 5px; margin-left: 10px;">Next</button>
            </div>
        `;

        target.innerHTML = `<div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; padding: 10px;">${g2mesHtml}</div>${paginationHtml}`;
    };

    target.addEventListener('click', (event) => {
        const totalPages = Math.ceil(allG2mes.length / g2mesPerPage);
        if (event.target.id === 'prev-page' && currentPage > 1) {
            currentPage--;
            renderG2mes();
        }
        if (event.target.id === 'next-page' && currentPage < totalPages) {
            currentPage++;
            renderG2mes();
        }
    });

    renderG2mes();


    window.openg2me = async (url, title) => {
        const g2mePageContainer = document.getElementById("g2mePageContainer");
        const g2mePageFrame = document.getElementById("g2mePageFrame");
        const g2mePageTitle = document.getElementById("g2mePageTitle");

        g2mePageTitle.textContent = title;
        g2mePageFrame.src = await getProxied(url);
        g2mePageContainer.style.display = "flex";
        document.body.style.overflow = 'hidden';
    };

    window.closeg2me = () => {
        const g2mePageContainer = document.getElementById("g2mePageContainer");
        const g2mePageFrame = document.getElementById("g2mePageFrame");

        g2mePageFrame.src = "";
        g2mePageContainer.style.display = "none";
        document.body.style.overflow = '';
    };

		document.getElementById("backBtn").addEventListener("click", () => {
			closeg2me();
		})
		document.getElementById("fullscreenBtn").addEventListener("click", () => {
			document.getElementById("g2mePageFrame").requestFullscreen();
		})
})();
