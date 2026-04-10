function setupSearch() {
	const dialog = document.getElementById("search-dialog");
	const closeBtn = document.querySelector("button[data-close-modal]");
	const dialogFrame = dialog?.querySelector(".dialog-frame");

	if (!dialog) {
		return;
	}

	function openModal(event) {
		document.documentElement.style.overflow = "hidden";
		dialog.showModal();
		setTimeout(() => {
			dialog.querySelector("input")?.focus();
		}, 50);
		event?.stopPropagation();
		window.addEventListener("click", onWindowClick, { capture: true });
	}

	function closeModal() {
		document.documentElement.style.overflow = "";
		dialog.close();
	}

	function onWindowClick(event) {
		const target = event.target;
		const isLink = !!target && "href" in target;
		if (isLink || (target && document.body.contains(target) && !dialogFrame?.contains(target))) {
			closeModal();
		}
	}

	function onKeydownGlobal(e) {
		if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
			dialog.open ? closeModal() : openModal(e);
			e.preventDefault();
		}
		if (e.key === "Escape" && dialog.open) {
			closeModal();
			e.preventDefault();
		}
	}

	const allOpenBtns = document.querySelectorAll("button[data-open-modal]");
	allOpenBtns.forEach((btn) => {
		btn.addEventListener("click", openModal);
		btn.disabled = false;
	});

	if (closeBtn) {
		closeBtn.addEventListener("click", closeModal);
	}

	dialog.addEventListener("close", () => {
		window.removeEventListener("click", onWindowClick);
	});

	document.addEventListener("keydown", onKeydownGlobal);
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", setupSearch);
} else {
	setupSearch();
}

document.addEventListener("astro:after-swap", setupSearch);
