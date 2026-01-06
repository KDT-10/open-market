// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");

// Toggle sidebar
function toggleSidebar() {
  mobileMenuBtn.classList.toggle("active");
  sidebar.classList.toggle("active");
  sidebarOverlay.classList.toggle("active");

  // Prevent body scroll when sidebar is open
  if (sidebar.classList.contains("active")) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
}

// Event listeners
mobileMenuBtn.addEventListener("click", toggleSidebar);
sidebarOverlay.addEventListener("click", toggleSidebar);

// Close sidebar when clicking nav items on mobile
const navItems = document.querySelectorAll(".nav-item");
navItems.forEach((item) => {
  item.addEventListener("click", () => {
    if (window.innerWidth <= 768) {
      toggleSidebar();
    }
  });
});

// Close sidebar on window resize (if transitioning from mobile to desktop)
window.addEventListener("resize", () => {
  if (window.innerWidth > 768) {
    mobileMenuBtn.classList.remove("active");
    sidebar.classList.remove("active");
    sidebarOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }
});

// Handle escape key to close sidebar
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && sidebar.classList.contains("active")) {
    toggleSidebar();
  }
});
