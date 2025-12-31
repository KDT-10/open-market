document.addEventListener("DOMContentLoaded", function () {
  const commonTab = document.getElementById("commonTab");
  const venderTab = document.getElementById("venderTab");

  commonTab.addEventListener("click", function () {
    commonTab.classList.add("active");
    venderTab.classList.remove("active");
  });

  venderTab.addEventListener("click", function () {
    venderTab.classList.add("active");
    commonTab.classList.remove("active");
  });
});
