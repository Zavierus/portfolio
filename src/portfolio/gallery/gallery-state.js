export function createGalleryState(items = []) {
  return {
    items,
    selectedIndex: items.length ? 0 : -1,
    viewerOpen: false,
    returnFocusId: null,
  };
}

function findItemIndex(items, id) {
  return items.findIndex((item) => item.id === id);
}

export function galleryReducer(state, action = {}) {
  if (state.items.length === 0) return state;

  switch (action.type) {
    case "SELECT": {
      const selectedIndex = findItemIndex(state.items, action.id);
      if (selectedIndex < 0 || selectedIndex === state.selectedIndex) return state;
      return { ...state, selectedIndex };
    }

    case "OPEN": {
      const selectedIndex =
        action.id === undefined
          ? state.selectedIndex
          : findItemIndex(state.items, action.id);
      if (selectedIndex < 0) return state;

      const returnFocusId = state.items[selectedIndex].id;
      if (
        state.viewerOpen &&
        selectedIndex === state.selectedIndex &&
        returnFocusId === state.returnFocusId
      ) {
        return state;
      }

      return {
        ...state,
        selectedIndex,
        viewerOpen: true,
        returnFocusId,
      };
    }

    case "CLOSE":
      if (!state.viewerOpen) return state;
      return { ...state, viewerOpen: false };

    case "PREVIOUS": {
      if (state.items.length === 1) return state;
      const selectedIndex =
        (state.selectedIndex - 1 + state.items.length) % state.items.length;
      return { ...state, selectedIndex };
    }

    case "NEXT": {
      if (state.items.length === 1) return state;
      const selectedIndex = (state.selectedIndex + 1) % state.items.length;
      return { ...state, selectedIndex };
    }

    default:
      return state;
  }
}
