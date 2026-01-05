export function setTabGroup(activeClassName, tabsData) {
  // 초기 탭 렌더링
  setTabActive(activeClassName, tabsData, 0);

  tabsData.forEach((tabObj, i) => {
    // 클릭 이벤트 바인딩
    tabObj.tab.addEventListener("click", () => {
      setTabActive(activeClassName, tabsData, i);
    });

    // 키보드 이벤트 바인딩
    tabObj.tab.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        e.preventDefault();

        let currentIndex = null;
        switch (e.key) {
          case "ArrowLeft":
            currentIndex = (index - 1 + tabsData.length) % tabsData.length;
            break;
          case "ArrowRight":
            currentIndex = (index + 1) % tabsData.length;
            break;
          case "Home":
            currentIndex = 0;
            break;
          case "End":
            currentIndex = tabsData.length - 1;
            break;
        }

        setTabActive(activeClassName, tabsData, currentIndex);
      }
    });
  })
}

function setTabActive(activeClassName, tabsData, idx) {
  tabsData.forEach((tabData) => {
    tabData.tab.classList.remove(activeClassName);
    if (tabData.content) tabData.content.classList.remove(activeClassName);
  });
  tabsData[idx].tab.classList.add(activeClassName);
  if (tabsData[idx].content) tabsData[idx].content.classList.add(activeClassName);
  tabsData[idx].tab.focus();
}