function setTabGroup(...tabs) {
  // 초기 탭 렌더링
  // 다른 탭 비활성화
  tabs.forEach((tab) => tab.classList.remove("active"));
  // 클릭된 탭 활성화
  tabs[0].classList.add("active");
  tabs[0].focus();

  tabs.forEach((tab) => {
    // 클릭 이벤트 바인딩
    tab.addEventListener("click", () => {
      // 다른 탭 비활성화
      tabs.forEach((tab) => tab.classList.remove("active"));
      // 클릭된 탭 활성화
      tab.classList.add("active");
      tab.focus();
    });

    // 키보드 이벤트 바인딩
    tab.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        e.preventDefault();

        let currentIndex = null;
        switch (e.key) {
          case "ArrowLeft":
            currentIndex = (index - 1 + tabs.length) % tabs.length;
            break;
          case "ArrowRight":
            currentIndex = (index + 1) % tabs.length;
            break;
          case "Home":
            currentIndex = 0;
            break;
          case "End":
            currentIndex = tabs.length - 1;
            break;
        }

        // 다른 탭 비활성화
        tabs.forEach((tab) => tab.classList.remove("active"));
        // 선택된 탭 활성화
        tabs[currentIndex].classList.add("active");
        tabs[currentIndex].focus();
      }
    });
  })
}